from flask import Blueprint, request, jsonify, render_template
from app.db import supabase
from app.security import hash_password, verify_password

main = Blueprint("main", __name__)


# =====================================================
# PAGINA'S
# =====================================================

@main.route("/")
def login():
    return render_template("login.html")

@main.route("/register")
def register():
    return render_template("registreer.html")


# =====================================================
# AUTHENTICATIE
# =====================================================

@main.route("/login", methods=["POST"])
def login_user():
    data     = request.json
    email    = data.get("email")
    password = data.get("password")

    # Zoek gebruiker op via e-mail
    result = supabase.table("patients").select("*").eq("email", email).execute()

    if not result.data:
        return jsonify({"success": False, "message": "Geen account gevonden met dit e-mailadres."}), 404

    user = result.data[0]

    # Vergelijk wachtwoord met de opgeslagen hash
    if verify_password(password, user["password_hash"]):
        return jsonify({
            "success": True,
            "message": "Ingelogd",
            "patient_id": user["patient_id"]
        })
    else:
        return jsonify({"success": False, "message": "Verkeerd wachtwoord."}), 401


# =====================================================
# PATIENTS
# =====================================================

@main.route("/patients")
def get_patients():
    """
    cvxcvxcv
    """
    return jsonify(supabase.table("patients").select("*").execute().data)


@main.route("/patients/add", methods=["POST"])
def add_patient():
    data = request.json

    supabase.table("patients").insert({
        "name": data["name"],
        "date_of_birth": data["date_of_birth"],
        "email": data["email"],
        "password_hash": hash_password(data["password"])
    }).execute()

    return {"message": "Patient added"}


# CHANGE PASSWORD (met hashing)
@main.route("/patients/change-password/<patient_id>", methods=["PUT"])
def change_password(patient_id):
    data = request.json

    new_hash = hash_password(data["new_password"])

    supabase.table("patients").update({
        "password_hash": new_hash
    }).eq("patient_id", patient_id).execute()

    return {"message": "Password updated"}


# =====================================================
# SESSIONS
# =====================================================

@main.route("/sessions")
def get_sessions():
    return jsonify(supabase.table("sessions").select("*").execute().data)


@main.route("/sessions/add", methods=["POST"])
def add_session():
    data = request.json

    supabase.table("sessions").insert({
        "patient_id": data["patient_id"],
        "startdate": data["startdate"],
        "enddate": data["enddate"],
        "starttime": data["starttime"],
        "endtime": data["endtime"],
        "bottle1_ml": data["bottle1_ml"],
        "bottle2_ml": data.get("bottle2_ml"),
        "total_ml": data["total_ml"],
        "type": data["type"],
        "status": data.get("status", "actief")
    }).execute()

    return {"message": "Session created"}


@main.route("/sessions/update/<session_id>", methods=["PUT"])
def update_session(session_id):
    data = request.json

    supabase.table("sessions").update({
        "startdate": data.get("startdate"),
        "enddate": data.get("enddate"),
        "starttime": data.get("starttime"),
        "endtime": data.get("endtime"),
        "bottle1_ml": data.get("bottle1_ml"),
        "bottle2_ml": data.get("bottle2_ml"),
        "total_ml": data.get("total_ml"),
        "type": data.get("type"),
        "status": data.get("status")
    }).eq("session_id", session_id).execute()

    return {"message": "Session updated"}


@main.route("/sessions/delete/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    supabase.table("sessions").delete().eq("session_id", session_id).execute()

    return {"message": "Session deleted"}