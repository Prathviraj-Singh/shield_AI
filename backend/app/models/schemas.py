from pydantic import BaseModel

class DetectRequest(BaseModel):
    message: str
    user_id: str

class DetectResponse(BaseModel):
    is_scam: bool
    scam_type: str
    confidence: float
    guidance: str
