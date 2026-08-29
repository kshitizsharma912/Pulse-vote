from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    role = Column(
        String(20),
        nullable=False,
        default="user",
        server_default="user",
    )
    password_hash = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    polls = relationship(
        "Poll",
        back_populates="creator",
    )
    votes = relationship(
        "Vote",
        back_populates="user",
    )


class Poll(Base):
    __tablename__ = "polls"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    question = Column(
        Text,
        nullable=False,
    )
    code = Column(
        String(10),
        unique=True,
        index=True,
        nullable=False,
    )
    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    creator = relationship(
        "User",
        back_populates="polls",
    )
    options = relationship(
        "PollOption",
        back_populates="poll",
    )
    votes = relationship(
        "Vote",
        back_populates="poll",
    )


class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    option_text = Column(
        String(255),
        nullable=False,
    )
    poll_id = Column(
        Integer,
        ForeignKey("polls.id"),
        nullable=False,
    )

    poll = relationship(
        "Poll",
        back_populates="options",
    )
    votes = relationship(
        "Vote",
        back_populates="option",
    )


class Vote(Base):
    __tablename__ = "votes"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "poll_id",
            name="one_vote_per_user_per_poll",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
    poll_id = Column(
        Integer,
        ForeignKey("polls.id"),
        nullable=False,
    )
    option_id = Column(
        Integer,
        ForeignKey("poll_options.id"),
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="votes",
    )
    poll = relationship(
        "Poll",
        back_populates="votes",
    )
    option = relationship(
        "PollOption",
        back_populates="votes",
    )