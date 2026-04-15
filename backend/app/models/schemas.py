from pydantic import BaseModel
from typing import List

class ActionStep(BaseModel):
    tool: str
    observation: str

class DetectRequest(BaseModel):
    message: str
    user_id: str

class DetectResponse(BaseModel):
    is_scam: bool
    scam_type: str
    confidence: float
    guidance: str
    actions_taken: List[ActionStep] = []
