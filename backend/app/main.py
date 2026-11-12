from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.schemas.commerce import (
    CreateOrderRequest,
    OrderResponse,
    PayPalCaptureRequest,
    AgentChatRequest
)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="AgentPay AI: Agentic AI Commerce Gateway & PayPal Sandbox Integration"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "paypalMode": settings.PAYPAL_MODE
    }

@app.get("/")
def root():
    return {"message": "AgentPay AI FastAPI Core Gateway active. Visit /docs for OpenAPI specifications."}
