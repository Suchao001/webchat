from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ฟังก์ชันสำหรับเข้ารหัสรหัสผ่าน
def hash_password(password: str):
    return pwd_context.hash(password)

# ฟังก์ชันสำหรับตรวจสอบรหัสผ่าน
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ฟังก์ชันสำหรับสร้าง access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
