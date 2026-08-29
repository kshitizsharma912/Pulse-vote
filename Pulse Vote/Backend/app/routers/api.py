from fastapi import APIRouter


from app.routers.poll import router as poll_router
from app.routers.user import router as user_router
from app.routers.vote import router as vote_router


router = APIRouter(prefix="/api")


router.include_router(user_router)
router.include_router(poll_router)
router.include_router(vote_router)