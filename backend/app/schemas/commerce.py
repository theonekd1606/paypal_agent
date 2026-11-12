from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

Currency = Literal["USD", "EUR", "GBP", "INR"]
OrderStatus = Literal["PENDING", "AWAITING_PAYMENT", "PAID", "PAYMENT_FAILED", "CANCELLED"]

class ProductSchema(BaseModel):
    id: str
    name: str
    tagline: str
    description: str
    category: str
    price: float
    currency: Currency = "USD"
    billingPeriod: str = "monthly"
    features: List[str]
    specs: Dict[str, str]
    rating: float
    reviewsCount: int
    availability: str
    image: str
    active: bool = True
    tags: List[str]

class OrderItemSchema(BaseModel):
    productId: str
    productName: str
    quantity: int = Field(gt=0)
    unitPrice: float
    subtotal: float

class CreateOrderRequest(BaseModel):
    items: List[Dict[str, int]]
    metadata: Optional[Dict[str, str]] = None

class OrderResponse(BaseModel):
    id: str
    userId: str
    items: List[OrderItemSchema]
    totalAmount: float
    currency: Currency
    status: OrderStatus
    userApproved: bool
    paypalOrderId: Optional[str] = None
    paypalCaptureId: Optional[str] = None
    createdAt: str

class PayPalCaptureRequest(BaseModel):
    localOrderId: str
    paypalOrderId: str
    payerEmail: Optional[str] = "buyer.sandbox@agentpay.ai"

class AgentChatRequest(BaseModel):
    prompt: str
    budget: Optional[float] = 200.0
    conversationId: Optional[str] = "conv-default"
