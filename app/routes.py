"""
Flask routes en business logic voor de applicatie.

Deze module bevat alle route handlers. De routes communiceren met Supabase als
backend database en gebruiken bcrypt-gebaseerde wachtwoordbeveiliging.

Daarnaast wordt sessiebeheer gebruikt om 2FA-flows tijdelijk op te slaan
en te controleren.

Functionaliteiten:
- De flows naar de verschillende pagina's
- Patient CRUD operaties
- Session CRUD operaties
- E-mail verzending van 2FA codes
"""

import random
import time
from flask import Blueprint, request, jsonify, render_template, session
from app.db import supabase
from app.security import hash_password, verify_password
from app.mailservice import send_2fa_code

main = Blueprint("main", __name__)

CODE_TTL_SEC  = 5 * 60   # code geldig voor 5 minuten
MAX_ATTEMPTS  = 5        # maximaal 5 pogingen


# PAGINA'S

@main.route("/")
def login():
    """Render de loginpagina."""
    return render_template("login.html")


@main.route("/register")
def register():
    """Render de registratiepagina."""
    return render_template("registreer.html")


@main.route("/verifieer-2fa")
def verifieer_2fa_page():
    """Render de 2FA verificatiepagina."""
    return render_template("verifieer_2fa.html")

@main.route("/homepagina")
def homepagina():
    """Render de homepagina."""
    return render_template("homepagina.html")

@main.route("/herinnering")
def herinnering():
    """Render de herinneringpagina."""
    return render_template("herinnering.html")

@main.route("/uitleg")
def uitleg():
    """Render de uitlegpagina."""
    return render_template("uitleg.html")

@main.route("/meting")
def meting():
    """Render de metingpagina."""
    return render_template("meting.html")

@main.route("/help")
def help():
    """Render de helppagina."""
    return render_template("help.html")

@main.route("/account")
def account():
    """Render de accountpagina."""
    return render_template("account.html")

@main.route("/uitleg2")
def uitleg2():
    """Render de tweede uitlegpagina."""
    return render_template("uitleg2.html")

@main.route("/stap1")
def stap1():
    """Render naar stap 1 uitleg."""
    return render_template("stap1.html")

@main.route("/stap2")
def stap2():
    """Render naar stap 2 uitleg."""
    return render_template("stap2.html")

@main.route("/stap3")
def stap3():
    """Render naar stap 3 uitleg."""
    return render_template("stap3.html")

@main.route("/stap4")
def stap4():
    """Render naar stap 4 uitleg."""
    return render_template("stap4.html")


# AUTHENTICATIE

@main.route("/login", methods=["POST"])
def login_user():
    """
    Verwerkt een loginverzoek en start de 2FA flow indien succesvol.

    Controleert email en wachtwoord tegen de database. Bij correcte
    informatie wordt een 2FA-code gegenereerd, opgeslagen in de sessie
    en per e-mail verzonden naar de gebruiker.
    """
    data     = request.json
    email    = (data.get("email") or "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Vul alle velden in."}), 400

    result = supabase.table("patients").select("*").eq("email", email).execute()

    if not result.data:
        return jsonify({"success": False, "message": "Geen account gevonden met dit e-mailadres."}), 404

    user = result.data[0]

    if not verify_password(password, user["password_hash"]):
        return jsonify({"success": False, "message": "Verkeerd wachtwoord."}), 401

    code       = str(random.randint(100000, 999999))
    expires_at = time.time() + CODE_TTL_SEC

    session["pending_patient_id"] = user["patient_id"]
    session["pending_email"]      = email
    session["2fa_code"]           = code
    session["2fa_expires"]        = expires_at
    session["2fa_attempts"]       = 0

    send_2fa_code(email, code)

    return jsonify({"success": True, "message": "2FA_REQUIRED"})


@main.route("/auth/verifieer-2fa", methods=["POST"])
def verifieer_2fa():
    """
    Verifieert de ingevoerde 2FA-code.

    Controleert of de code correct is, niet verlopen is en of het aantal
    pogingen niet is overschreden. Bij succes wordt de gebruiker definitief
    ingelogd.
    """
    data = request.json
    code = (data.get("code") or "").strip()

    if "2fa_code" not in session or "pending_patient_id" not in session:
        return jsonify({"success": False, "message": "2FA niet gestart. Log opnieuw in."}), 401

    attempts = session.get("2fa_attempts", 0)
    if attempts >= MAX_ATTEMPTS:
        _clear_2fa()
        _clear_pending()
        return jsonify({"success": False, "message": "Te veel pogingen. Log opnieuw in."}), 401

    if time.time() > session["2fa_expires"]:
        _clear_2fa()
        _clear_pending()
        return jsonify({"success": False, "message": "Code verlopen. Log opnieuw in."}), 401

    if code != session["2fa_code"]:
        session["2fa_attempts"] = attempts + 1
        remaining = MAX_ATTEMPTS - session["2fa_attempts"]
        return jsonify({"success": False, "message": f"Verkeerde code. Nog {remaining} poging(en)."}), 401

    patient_id = session.pop("pending_patient_id")
    session["patient_id"] = patient_id

    _clear_2fa()
    _clear_pending()

    return jsonify({"success": True, "message": "OK", "patient_id": patient_id})


@main.route("/auth/resend-2fa", methods=["POST"])
def resend_2fa():
    """
    Genereert en verstuurt een nieuwe 2FA-code.

    Gebruikt de opgeslagen e-mail in de sessie en reset de 2FA timer en
    pogingen.
    """
    email = session.get("pending_email")
    if not email:
        return jsonify({"success": False, "message": "2FA niet gestart. Log opnieuw in."}), 401

    code       = str(random.randint(100000, 999999))
    expires_at = time.time() + CODE_TTL_SEC

    session["2fa_code"]     = code
    session["2fa_expires"]  = expires_at
    session["2fa_attempts"] = 0

    send_2fa_code(email, code)

    return jsonify({"success": True, "message": "Nieuwe code verstuurd."})


@main.route("/auth/logout", methods=["POST"])
def logout():
    """Logt de gebruiker uit door de sessie te wissen."""
    session.clear()
    return jsonify({"success": True, "message": "Uitgelogd."})


# PATIENTS

@main.route("/patients")
def get_patients():
    """
    Haalt alle patiënten op uit de database.
    """
    return jsonify(supabase.table("patients").select("*").execute().data)


@main.route("/patients/add", methods=["POST"])
def add_patient():
    """
    Voegt een nieuwe patiënt toe aan de database.

    Het wachtwoord wordt veilig gehashed voordat het wordt opgeslagen.
    """
    data = request.json

    supabase.table("patients").insert({
        "name": data["name"],
        "date_of_birth": data["date_of_birth"],
        "email": data["email"],
        "password_hash": hash_password(data["password"])
    }).execute()

    return {"message": "Patient added"}


@main.route("/patients/change-password/<patient_id>", methods=["PUT"])
def change_password(patient_id):
    """
    Wijzigt het wachtwoord van een patiënt.

    Het nieuwe wachtwoord wordt gehashed voordat het wordt opgeslagen.
    """
    data = request.json

    new_hash = hash_password(data["new_password"])

    supabase.table("patients").update({
        "password_hash": new_hash
    }).eq("patient_id", patient_id).execute()

    return {"message": "Password updated"}

# ACCOUNT

@main.route("/account/data")
def account_data():
    """
    Geeft de gegevens van de ingelogde patiënt terug (naam, email, geboortedatum).
    """
    patient_id = session.get("patient_id")
    if not patient_id:
        return jsonify({"success": False, "message": "Niet ingelogd."}), 401

    result = supabase.table("patients") \
        .select("patient_id, name, email, date_of_birth") \
        .eq("patient_id", patient_id) \
        .execute()

    if not result.data:
        return jsonify({"success": False, "message": "Account niet gevonden."}), 404

    return jsonify({"success": True, "patient": result.data[0]})


@main.route("/account/change-password", methods=["PUT"])
def account_change_password():
    """
    Wijzigt het wachtwoord van de ingelogde patiënt.
    """
    patient_id = session.get("patient_id")
    if not patient_id:
        return jsonify({"success": False, "message": "Niet ingelogd."}), 401

    data = request.json or {}
    new_password = (data.get("new_password") or "").strip()

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "message": "Wachtwoord moet minimaal 6 tekens bevatten."
        }), 400

    new_hash = hash_password(new_password)

    supabase.table("patients").update({
        "password_hash": new_hash
    }).eq("patient_id", patient_id).execute()

    return jsonify({"success": True, "message": "Wachtwoord bijgewerkt."})


@main.route("/account/delete", methods=["DELETE"])
def account_delete():
    """
    Verwijdert het account van de ingelogde patiënt en logt uit.
    """
    patient_id = session.get("patient_id")
    if not patient_id:
        return jsonify({"success": False, "message": "Niet ingelogd."}), 401

    supabase.table("patients").delete().eq("patient_id", patient_id).execute()
    session.clear()

    return jsonify({"success": True, "message": "Account verwijderd."})

# SESSIONS

@main.route("/sessions")
def get_sessions():
    """Haalt alle sessies op uit de database."""
    return jsonify(supabase.table("sessions").select("*").execute().data)


@main.route("/sessions/add", methods=["POST"])
def add_session():
    """
    Maakt een nieuwe sessie aan voor de ingelogde patiënt.
    Alleen de meegestuurde velden worden in de database opgeslagen.
    De patient_id wordt uit de Flask-sessie gehaald.
    """
    patient_id = session.get("patient_id")
    if not patient_id:
        return jsonify({"success": False, "message": "Niet ingelogd."}), 401

    data = request.json or {}

    # Verplichte velden
    record = {"patient_id": patient_id}

    # Optionele velden: alleen toevoegen als ze in de request zitten
    optionele_velden = [
        "startdate", "enddate", "starttime", "endtime",
        "bottle1_ml", "bottle2_ml", "total_ml", "type", "status"
    ]
    for veld in optionele_velden:
        if veld in data:
            record[veld] = data[veld]

    result = supabase.table("sessions").insert(record).execute()
    session_id = result.data[0]["session_id"] if result.data else None

    return jsonify({"success": True, "message": "Session created", "session_id": session_id})


@main.route("/sessions/update/<session_id>", methods=["PUT"])
def update_session(session_id):
    """
    Werkt een bestaande sessie bij.
    Alleen de meegestuurde velden worden bijgewerkt (partial update).
    """
    data = request.json or {}

    # Filter None-waarden eruit zodat bestaande DB-waarden niet worden overschreven
    updates = {k: v for k, v in data.items() if v is not None}

    if not updates:
        return jsonify({"success": False, "message": "Geen velden om bij te werken."}), 400

    supabase.table("sessions").update(updates).eq("session_id", session_id).execute()

    return jsonify({"success": True, "message": "Session updated"})


@main.route("/sessions/delete/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """Verwijdert een sessie uit de database."""
    supabase.table("sessions").delete().eq("session_id", session_id).execute()
    return {"message": "Session deleted"}


# HELPER FUNCTIONS

def _clear_2fa():
    """Verwijdert alle 2FA-gegevens uit de sessie."""
    session.pop("2fa_code", None)
    session.pop("2fa_expires", None)
    session.pop("2fa_attempts", None)


def _clear_pending():
    """Verwijdert tijdelijke logingegevens uit de sessie."""
    session.pop("pending_patient_id", None)
    session.pop("pending_email", None)