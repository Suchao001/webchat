from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from backend.database.session import SessionLocal
from backend.models.user import User
from backend.core.security import hash_password, verify_password, create_access_token
from jose import JWTError, jwt
import os
router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

class RegisterRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register_user(request: RegisterRequest):
    db = SessionLocal()
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(username=request.username, password=hash_password(request.password))
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully","success":True}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(response: Response, request: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user.username, "user_id": user.id})

    # ✅ ตั้งค่า Cookie อัตโนมัติ
    response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=False,  # ✅ ปิด Secure สำหรับ HTTP
    samesite="Lax"  # ✅ ป้องกันการถูกบล็อกใน HTTP
)

    
    return {"message": "Login successful","success":True}

@router.get("/users/me")
def read_users_me(request: Request):
    token = request.cookies.get("access_token")  # ✅ ดึง Token จาก Cookie
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        return {"username": username, "user_id": user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}
