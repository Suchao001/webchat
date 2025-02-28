from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)  # Store hashed passwords
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")