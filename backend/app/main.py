from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import detect, alerts, reports

app = FastAPI(title="ShieldAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect.router, prefix="/api", tags=["Detection"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ShieldAI Core Backend"}
