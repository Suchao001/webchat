import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from pydantic import BaseModel
from aift import setting
from aift.nlp.longan import tokenizer
from aift.multimodal import textqa
from aift.nlp.translation import en2th, th2en, th2zh
from aift.image import thaifood
from dotenv import load_dotenv
from aift.image.detection import carlogo
import shutil
from backend.database.session import SessionLocal
from backend.models.chat_message_model import ChatMessage, ChatMessageCreate
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from contextlib import contextmanager
from aift.nlp.translation import zh2th
from aift.multimodal import vqa


# Load environment variables
load_dotenv()
setting.set_api_key(os.getenv("AIFORTHAI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Ensure the images directory exists
os.makedirs("./images", exist_ok=True)

class TextRequest(BaseModel):
    text: str



SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_id_from_token(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user_id

@router.post("/tokenize")
async def tokenize_text(request: TextRequest):
    tokens = tokenizer.tokenize(request.text)
    return {"tokens": tokens}

@router.post("/textqa")
async def qa_text(request: TextRequest):
    response = textqa.generate(request.text)
    return {"answer": response["content"]}

@router.post("/en2th")
async def en2th_text(request: TextRequest):
    response = en2th.translate(request.text)
    return {"translate": response}

@router.post("/th2en")
async def th2en_text(request: TextRequest):
    response = th2en.translate(request.text)
    return {"translate": response}

@router.post("/th2zh")
async def th2zh_text(request: TextRequest):
    response = th2zh.translate(request.text, return_json=False)
    return {"translate": response}

@router.post("/zh2th")
async def zh2th_text(request: TextRequest):
    response = zh2th.translate(request.text, return_json=False)
    print(response)
    return {"translate": response}

@router.post("/thaifood")
async def thaifood_image(file: UploadFile = File(...)):
    """Handle image upload for Thai food analysis."""
    file_path = f"./public/images/{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        response = thaifood.analyze(file_path)
        logger.info(f"Thai food analysis result: {response}")
        return {"food": response}
    except Exception as e:
        logger.error(f"Error processing Thai food image: {e}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.post("/image_describe")
async def describe_image(file: UploadFile):
    """Handle image upload for car logo recognition."""
    file_path = f"./public/images/{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        response = vqa.generate(file_path,"บรรยายรูปนี้")
        logger.info(f"image describe result: {response}")
        return {"image_describe": response}
    except Exception as e:
        logger.error(f"Error processing car logo image: {e}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.post("/carlogo")
async def carlogo_image(file: UploadFile = File(...)):
    """Handle image upload for car logo recognition."""
    file_path = f"./public/images/{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        response = carlogo.analyze(file_path, return_json=True)
        logger.info(f"Car logo recognition result: {response}")
        return {"car": response}
    except Exception as e:
        logger.error(f"Error processing car logo image: {e}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.post("/save_message/")
def create_chat_message(request: Request, chat_message: ChatMessageCreate, db: Session = Depends(get_db)):
    # Get the user ID from the token stored in the request cookies
    user_id = get_user_id_from_token(request)
    
    if(chat_message.image_url is None):
        db_message = ChatMessage(
            user_id=user_id,
            user_message=chat_message.user_message,  # Save the user message
            bot_message=chat_message.bot_message, 
              # Save the bot message
        )
    else:
        db_message = ChatMessage(
            user_id=user_id,
            user_message=chat_message.user_message,  # Save the user message
            bot_message=chat_message.bot_message, 
            image_url=chat_message.image_url  # Save the bot message
        )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return {"id": db_message.id, "user_id": db_message.user_id, "user_message": db_message.user_message, "bot_message": db_message.bot_message}



@router.get("/chat_history")
async def chat_history(request: Request, db: Session = Depends(get_db), page: int = 1, limit: int = 50):
    try:
        # Get user_id from token (make sure this function works properly)
        user_id = get_user_id_from_token(request)
        # Fetch the chat history with ordering by created_at in ascending order
        messages = db.query(ChatMessage).filter(ChatMessage.user_id == user_id) \
                    .order_by(ChatMessage.created_at.asc()) \
                    .offset((page - 1) * limit) \
                    .limit(limit).all()
        # Return the formatted message data
        return {
            "messages": [
                {
                    "id": msg.id,
                    "user_message": msg.user_message,
                    "bot_message": msg.bot_message,
                    "image_url": msg.image_url,
                    "created_at": msg.created_at
                } for msg in messages
            ]
        }
    
    except Exception as e:
        # Log error if any
        logger.error(f"Error retrieving chat history: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving chat history")
    
    
@router.delete("/chat_history")
async def delete_chat_history(request: Request, db: Session = Depends(get_db)):
    try:
        # Get user_id from token
        user_id = get_user_id_from_token(request)
        
        # Delete user's chat history
        deleted_count = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
        db.commit()
        
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="No chat history found to delete")

        return {"message": "Chat history deleted successfully"}
    
    except Exception as e:
        logger.error(f"Error deleting chat history: {e}")
        raise HTTPException(status_code=500, detail="Error deleting chat history")
