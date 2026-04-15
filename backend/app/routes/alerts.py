from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db.supabase import supabase
from app.services.alert_service import send_sms_alert

router = APIRouter()

class AlertRequest(BaseModel):
    user_id: str
    message: str
    alert_type: str  # critical, warning, info
    phone: Optional[str] = None  # To send SMS if critical

class AlertResponse(BaseModel):
    status: str
    alert_id: str

@router.post("/alerts", response_model=AlertResponse)
async def create_alert(request: AlertRequest):
    try:
        # Save alert to Supabase
        db_data = {
            "user_id": request.user_id,
            "message": request.message,
            "alert_type": request.alert_type,
            "status": "unread"
        }
        res = supabase.table("alerts").insert(db_data).execute()
        alert_id = res.data[0]['id'] if res.data and len(res.data) > 0 else "unknown"

        # Automatically trigger SMS if the alert is categorized as 'critical'
        if request.alert_type.lower() == "critical":
            if request.phone:
                sms_text = f"CRITICAL SCAM ALERT from ShieldAI: {request.message}"
                send_sms_alert(request.phone, sms_text)
            else:
                print("Alert is critical, but no phone number provided for dispatch.")

        return AlertResponse(status="success", alert_id=str(alert_id))
    except Exception as e:
        print(f"Failed to process alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to create system alert.")
