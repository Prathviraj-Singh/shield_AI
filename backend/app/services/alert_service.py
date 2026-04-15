import os
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client

def send_sms_alert(phone: str, message: str) -> bool:
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_FROM_PHONE")
        
        if not all([account_sid, auth_token, from_phone]):
            print("Twilio credentials missing in .env. Skipping SMS.")
            return False

        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            body=message,
            from_=from_phone,
            to=phone
        )
        return True
    except Exception as e:
        print(f"Error sending SMS via Twilio: {e}")
        return False

def send_email_alert(email: str, subject: str, body: str) -> bool:
    try:
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        
        if not all([smtp_server, smtp_user, smtp_pass]):
            print("SMTP credentials missing in .env. Skipping Email.")
            return False

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = email

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            
        return True
    except Exception as e:
        print(f"Error sending Email: {e}")
        return False
