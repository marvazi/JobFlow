from sqlalchemy import Column, Integer, String,ForeignKey
from database import Base

class Application(Base):
    __tablename__= 'applications'

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    salary = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    position = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
