from datetime import datetime

from sqlalchemy.orm import Session
from .websocket_manager import manager
from db.models.model_notification import Notification
from db.models.model_notified_user import NotifiedUser
from db.models.model_staff_system_acc import StaffSystemAcc
import asyncio
from fastapi import WebSocket
from db.database import SessionLocal


def notify_superusers(message: str, db: Session) -> Notification:
    """
    Create a notification and notify all superusers (including the current actor).
    This is sync, returns the Notification object in case it's needed.
    """
    try:
        # 1. Create Notification record
        notification = Notification(message=message)
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # 2. Get all superusers
        superusers = db.query(StaffSystemAcc).filter(StaffSystemAcc.is_super.is_(True)).all()

        # 3. Create NotifiedUser records
        for user in superusers:
            notified = NotifiedUser(
                account_id=user.account_id,
                notification_id=notification.notification_id,
                has_received=False
            )
            db.add(notified)

        db.commit()

        # 4. Attempt real-time push
        for user in superusers:
            ws = manager.get_connection(user.account_id)
            if ws:
                asyncio.create_task(_send_and_mark_received(
                    ws, user.account_id, notification
                ))

        return notification

    finally:
        pass


async def _send_and_mark_received(ws: WebSocket, account_id: int, notification: Notification):
    """
    Sends notification over WebSocket and marks as received.
    """
    db: Session = SessionLocal()
    try:
        await ws.send_json({
            "notification_id": notification.notification_id,
            "message": notification.message,
            "created_at": str(notification.created_at),
            "has_read": False,
        })

        db.query(NotifiedUser).filter_by(
            account_id=account_id,
            notification_id=notification.notification_id
        ).update({
            "has_received": True,
            "received_at": datetime.utcnow()
        })

        db.commit()

    except Exception as e:
        print(f"[Notify Error] Failed to send to {account_id}: {e}")
    finally:
        db.close()


async def send_undelivered_notifications(user_id: int):
    """
    When a user connects,this function will update the
    received status and update received time in the db

    Args:
        user_id (int): The ID of the logged-in user.
    """
    db: Session = SessionLocal()
    try:
        results = db.query(NotifiedUser, Notification).join(Notification).filter(
            NotifiedUser.account_id == user_id,
            NotifiedUser.has_received.is_(False)
        ).all()

        for notified_user, notification in results:
            db.query(NotifiedUser).filter_by(
                notified_id=notified_user.notified_id
            ).update({"has_received": True,
                      "received_at": datetime.utcnow()})
        db.commit()
    finally:
        db.close()
