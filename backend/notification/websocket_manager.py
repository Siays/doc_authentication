from typing import Dict, Optional
from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections for each logged-in user.

    Attributes:
        active_connections (Dict[int, WebSocket]): Maps account_id to WebSocket connection.
    """

    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, account_id: int, websocket: WebSocket):
        """
        Accepts and stores a WebSocket connection for the given account_id.

        Args:
            account_id (int): The user account ID.
            websocket (WebSocket): The WebSocket connection.
        """
        await websocket.accept()
        self.active_connections[account_id] = websocket

    def disconnect(self, account_id: int):
        """
        Removes the WebSocket connection for the given account_id, if it exists.

        Args:
            account_id (int): The user account ID.
        """
        self.active_connections.pop(account_id, None)

    def get_connection(self, account_id: int) -> Optional[WebSocket]:
        """
        Retrieves the WebSocket connection for a given account_id.

        Args:
            account_id (int): The user account ID.

        Returns:
            Optional[WebSocket]: The user's WebSocket if connected, else None.
        """
        return self.active_connections.get(account_id)

    async def send_to_user(self, account_id: int, message: str):
        """
        Sends a message to a specific user via WebSocket.

        Args:
            account_id (int): The recipient's account ID.
            message (str): The message to send.
        """
        connection = self.get_connection(account_id)
        if connection:
            await connection.send_text(message)

    async def broadcast(self, message: str):
        """
        Sends a message to all currently connected WebSocket clients.

        Args:
            message (str): The message to broadcast.
        """
        for connection in self.active_connections.values():
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Failed to send to one connection: {e}")


manager = ConnectionManager()
