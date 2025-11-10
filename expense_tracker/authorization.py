from passlib.context import CryptContext
from datetime import timedelta, datetime
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
import os
import redis
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from random import randint

load_dotenv()
algorithm = os.getenv("algorithm")
secret_key = os.getenv("secret_key")

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: int, expire_time: int = 30) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expire_time)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    token = jwt.encode(payload, secret_key, algorithm=algorithm)
    return token

# --- REDIS CONNECTION AND OTP LOGIC ---
redis_url = os.getenv("REDIS_URL")
# Initialize client variable to None
r = None 

try:
    # Assign the connected client to the global variable 'r'
    r = redis.from_url(redis_url, decode_response=True)
    # Ping Redis to verify connection
    r.ping() 
    print("Successfully connected to Redis.")
except Exception as e:
    # Corrected log message
    print(f"Could not connect to Redis: {e}")

def generate_otp(email:str,expire_minutes:int=5):
    # Check if client 'r' is defined and connected
    if r is None:
        raise Exception("Redis client is not connected.")

    otp = randint(100000, 999999) 
    redis_key = f"otp:{email}"
    # Use the client instance 'r' for setex
    r.setex(redis_key, timedelta(minutes=expire_minutes), otp)
    return otp

def verify_otp(email:str,otp_input:int):
    # If the client is not connected, verification automatically fails
    if r is None:
        return False
        
    redis_key = f"otp:{email}"
    # Use the client instance 'r' for get
    stored_otp = r.get(redis_key)
    
    if not stored_otp:
        return False
        
    if str(stored_otp) != str(otp_input):
        return False
        
    # Use the client instance 'r' for delete
    r.delete(redis_key)
    return True
# --- END REDIS LOGIC ---

def otp_email_body(email: str, otp: int, expiry_minutes: int = 5):
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Expense Tracker - OTP Verification</h2>
        <p>Hello,</p>
        <p>You requested an OTP for your email <b>{email}</b> in <b>Expense Tracker</b>.</p>
        <h1 style="color: #FF5722;">{otp}</h1>
        <p>This OTP will expire in <b>{expiry_minutes} minutes</b>. Please do not share it with anyone.</p>
        <hr>
        <p style="font-size: 12px; color: #777;">
          If you didn’t request this OTP or need help, contact us at 
          <a href="mailto:support@gmail.com">support@gmail.com</a>.
        </p>
      </body>
    </html>
    """

def send_otp_email(to_email:str,otp:int):
      send_email=os.getenv("send_email")
      send_password=os.getenv("send_password")
      body=otp_email_body(to_email,otp)
      msg=MIMEMultipart()
      msg['From']=send_email
      msg['To']=to_email
      msg['Subject']="Your OTP Code"
      msg.attach(MIMEText(body,'html'))

      with smtplib.SMTP_SSL('smtp.gmail.com',465) as server:
          server.login(send_email,send_password)
          server.send_message(msg)
