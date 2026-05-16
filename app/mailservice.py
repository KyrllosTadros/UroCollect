"""
E-mailservice module voor het versturen van 2FA-codes.

Deze module verzorgt het versturen van tweefactorauthenticatie (2FA) codes
via e-mail met behulp van SMTP. De configuratie (SMTP host, poort en
inloggegevens) wordt geladen uit omgevingsvariabelen via een .env-bestand.

De module bouwt een HTML e-mail op en verstuurt deze veilig via een
beveiligde TLS-verbinding.

Omgevingsvariabelen:
    SMTP_HOST (str): SMTP server host (standaard: smtp.gmail.com)
    SMTP_PORT (int): SMTP poort (standaard: 587)
    SMTP_USER (str): SMTP gebruikersnaam / e-mailadres
    SMTP_PASS (str): SMTP wachtwoord of app password
    MAIL_FROM (str): Afzender e-mailadres (standaard: SMTP_USER)

Functie:
    send_2fa_code(to_email, code): Verstuurt een 2FA-code naar een gebruiker.
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST   = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT   = int(os.getenv("SMTP_PORT", 587))
SMTP_USER   = os.getenv("SMTP_USER")
SMTP_PASS   = os.getenv("SMTP_PASS")
MAIL_FROM   = os.getenv("MAIL_FROM", SMTP_USER)


def send_2fa_code(to_email: str, code: str):
    """Stuurt een 2FA-code per e-mail naar de gebruiker."""

    subject = "Uw inlogcode - Amsterdam UMC"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
        <div style="max-width:400px; margin:auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="color:#1f425d; text-align:center;">Amsterdam UMC</h2>
          <p style="color:#333;">Gebruik de onderstaande code om in te loggen. De code is <strong>5 minuten</strong> geldig.</p>
          <div style="text-align:center; margin:30px 0;">
            <span style="font-size:2.5rem; font-weight:bold; letter-spacing:10px; color:#d97c2b;">{code}</span>
          </div>
          <p style="color:#888; font-size:0.85rem;">Als u niet heeft geprobeerd in te loggen, kunt u deze e-mail negeren.</p>
          <p style="color:#888; font-size:0.85rem;"> Dit is een automatisch verzonden bericht, gelieve hier niet op te reageren.</p>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = MAIL_FROM
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(MAIL_FROM, to_email, msg.as_string())
