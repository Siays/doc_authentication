from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from .websocket_manager import manager
from notification.notification_service import send_undelivered_notifications

router = APIRouter()


@router.websocket("/ws/{account_id}")
async def websocket_endpoint(websocket: WebSocket, account_id: int):
    """
    WebSocket endpoint for client to establish real-time notification connection.

    When a user connects:
    - They are registered in ConnectionManager.
    - Any undelivered notifications are sent.
    - The connection is kept alive until user disconnects.

    Args:
        websocket (WebSocket): The WebSocket connection object.
        account_id (int): The ID of the connecting user.
    """
    print(f"WebSocket CONNECTED for user {account_id}")

    await manager.connect(account_id, websocket)
    await send_undelivered_notifications(account_id)
    try:
        while True:
            await websocket.receive_text()  # Keeps connection alive
    except WebSocketDisconnect:
        manager.disconnect(account_id)

