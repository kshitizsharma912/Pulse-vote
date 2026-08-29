
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


#user

class UserCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )
    email: EmailStr
    password: str = Field(
        min_length=6,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True
    )


# Poll Option


class PollOptionCreate(BaseModel):
    option_text: str = Field(
        min_length=1,
        max_length=255,
    )


class PollOptionResponse(BaseModel):
    id: int
    option_text: str
    vote_count: int = 0

    model_config = ConfigDict(
        from_attributes=True
    )


#poll

class PollCreate(BaseModel):
    question: str = Field(
        min_length=5,
        max_length=500,
    )

    options: list[PollOptionCreate] = Field(
        min_length=2,
        max_length=10,
    )


class PollResponse(BaseModel):
    id: int
    question: str
    code: str
    created_at: datetime

    total_votes: int = 0

    options: list[PollOptionResponse]

    model_config = ConfigDict(
        from_attributes=True
    )


# Vote


class VoteCreate(BaseModel):
    option_id: int



# Authentication


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=6,
        max_length=128,
    )


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

