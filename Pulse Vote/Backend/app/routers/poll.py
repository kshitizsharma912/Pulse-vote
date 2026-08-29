
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import secrets
import string

from app.db.connection import get_db
from app.models.tables import Poll, PollOption, User , Vote
from app.routers.auth import get_current_user
from app.schema.check import PollCreate, PollResponse
from app.websocket.manager import manager


router = APIRouter(
    prefix="/polls",
    tags=["Polls"],
)


def generate_poll_code(db: Session) -> str:
    characters = string.ascii_uppercase + string.digits

    while True:
        code = "".join(
            secrets.choice(characters)
            for _ in range(6)
        )

        existing_poll = (
            db.query(Poll)
            .filter(Poll.code == code)
            .first()
        )

        if not existing_poll:
            return code


@router.post(
    "/",
    response_model=PollResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_poll(
    poll_data: PollCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_poll = Poll(
        question=poll_data.question,
        code=generate_poll_code(db),
        creator_id=current_user.id,
    )

    for option in poll_data.options:
        new_poll.options.append(
            PollOption(
                option_text=option.option_text
            )
        )

    db.add(new_poll)
    db.commit()
    db.refresh(new_poll)

    return new_poll



@router.get(
    "/my",
    response_model=list[PollResponse],
)
def get_my_polls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    polls = (
        db.query(Poll)
        .filter(
            Poll.creator_id == current_user.id
        )
        .order_by(Poll.id.desc())
        .all()
    )

    response = []

    for poll in polls:

        # Total votes for this poll
        total_votes = (
            db.query(func.count(Vote.id))
            .filter(
                Vote.poll_id == poll.id
            )
            .scalar()
        ) or 0

        # Build options with vote counts
        options = []

        for option in poll.options:

            vote_count = (
                db.query(func.count(Vote.id))
                .filter(
                    Vote.option_id == option.id
                )
                .scalar()
            ) or 0

            options.append(
                {
                    "id": option.id,
                    "option_text": option.option_text,
                    "vote_count": vote_count,
                }
            )

        response.append(
            {
                "id": poll.id,
                "question": poll.question,
                "code": poll.code,
                "created_at": poll.created_at,
                "total_votes": total_votes,
                "options": options,
            }
        )

    return response




@router.get(
    "/{poll_code}",
    response_model=PollResponse,
)
def get_poll(
    poll_code: str,
    db: Session = Depends(get_db),
):
    poll = (
        db.query(Poll)
        .filter(Poll.code == poll_code)
        .first()
    )

    if not poll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll not found",
        )

    return poll


@router.websocket("/{poll_code}/ws")
async def poll_websocket(
    websocket: WebSocket,
    poll_code: str,
):
    print(
        f"WEBSOCKET CONNECT REQUEST: {poll_code}"
    )

    await manager.connect(
        poll_code,
        websocket,
    )

    print(
        f"WEBSOCKET CONNECTED: {poll_code}"
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        print(
            f"WEBSOCKET DISCONNECTED: {poll_code}"
        )

        manager.disconnect(
            poll_code,
            websocket,
        )

    except Exception as exc:
        print(
            f"WEBSOCKET ERROR {poll_code}: {exc}"
        )

        manager.disconnect(
            poll_code,
            websocket,
        )

