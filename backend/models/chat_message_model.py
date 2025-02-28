from sqlalchemy import Column, Integer, Text, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database.session import Base
from sqlalchemy.sql import func
from pydantic import BaseModel
from datetime import datetime

# Pydantic model for request body
class ChatMessageCreate(BaseModel):
    user_message: str = None
    bot_message: str
    image_url: str = None  # Optional image URL field

# SQLAlchemy model
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    user_message = Column(Text, index=True)
    bot_message = Column(Text, index=True)
    image_url = Column(String, index=True, nullable=True) 
    created_at = Column(DateTime, default=func.now())  # Use DateTime from SQLAlchemy
    
    user = relationship("User", back_populates="messages")