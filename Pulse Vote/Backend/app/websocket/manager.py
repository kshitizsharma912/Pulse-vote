from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[
            str, list[WebSocket]
        ] = {}

    async def connect(
        self,
        poll_code: str,
        websocket: WebSocket,
    ):
        await websocket.accept()

        self.active_connections.setdefault(
            poll_code,
            [],
        )

        self.active_connections[poll_code].append(
            websocket
        )

    def disconnect(
        self,
        poll_code: str,
        websocket: WebSocket,
    ):
        connections = self.active_connections.get(
            poll_code,
            [],
        )

        if websocket in connections:
            connections.remove(websocket)

        if not connections:
            self.active_connections.pop(
                poll_code,
                None,
            )

    async def broadcast(
        self,
        poll_code: str,
        message: dict,
    ):
        connections = self.active_connections.get(
            poll_code,
            [],
        )

        disconnected = []

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(
                poll_code,
                websocket,
            )


manager = ConnectionManager()