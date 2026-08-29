from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.connection import get_db
from app.models.tables import PollOption, User, Vote
from app.routers.auth import get_current_user
from app.schema.check import VoteCreate
from app.websocket.manager import manager


router = APIRouter(
    prefix="/votes",
    tags=["Votes"],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def cast_vote(
    vote_data: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    option = db.query(PollOption).filter(
        PollOption.id == vote_data.option_id
    ).first()

    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Poll option not found",
        )

    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.poll_id == option.poll_id,
    ).first()

    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted in this poll",
        )

    new_vote = Vote(
        user_id=current_user.id,
        poll_id=option.poll_id,
        option_id=option.id,
    )


    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)

    # Get the poll code for WebSocket broadcasting
    poll = option.poll

    # Count votes for every option in this poll
    option_counts = (
        db.query(
            Vote.option_id,
            func.count(Vote.id).label("vote_count"),
        )
        .filter(Vote.poll_id == poll.id)
        .group_by(Vote.option_id)
        .all()
    )

    # Convert counts into a simple dictionary
    counts = {
        option_id: vote_count
        for option_id, vote_count in option_counts
    }

    # Build live results
    results = []

    for poll_option in poll.options:
        results.append(
            {
                "option_id": poll_option.id,
                "option_text": poll_option.option_text,
                "vote_count": counts.get(
                    poll_option.id,
                    0,
                ),
            }
        )

    total_votes = (
        db.query(Vote)
        .filter(Vote.poll_id == poll.id)
        .count()
    )

    # Send live update to everyone watching this poll
    await manager.broadcast(
        poll.code,
        {
            "type": "vote_update",
            "poll_id": poll.id,
            "poll_code": poll.code,
            "total_votes": total_votes,
            "results": results,
        },
    )

    return {
        "message": "Vote recorded successfully",
        "vote_id": new_vote.id,
        "poll_id": new_vote.poll_id,
        "option_id": new_vote.option_id,
        "total_votes": total_votes,
        "results": results,
    }

