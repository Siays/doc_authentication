from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.crud import get_multi
from db.database import get_db
from db.models.model_notification import Notification
from db.models.model_notified_user import NotifiedUser

router = APIRouter()


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(account_id: str, notification_id: str, db: Session = Depends(get_db)):
    try:
        notification_id_int = int(notification_id)
        account_id_int = int(account_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    notified = db.query(NotifiedUser).filter_by(notification_id=notification_id_int, account_id=account_id_int).first()
    if not notified:
        raise HTTPException(status_code=404, detail="Notification not found")

    notified.has_read = True
    db.commit()
    return {"status": "success"}


@router.post("/notifications/{account_id}/read-all")
def read_all_notification(account_id: int, db: Session = Depends(get_db)):
    try:
        account_id_int = int(account_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    user_notification_list = get_multi(db, NotifiedUser, "account_id", account_id_int)

    for each in user_notification_list:
        each.has_read = True

    db.commit()
    return {"status": "success"}


@router.get("/notifications/{account_id}")
def get_notification(account_id: str, db: Session = Depends(get_db)):
    notif_list = (
        db.query(Notification, NotifiedUser.has_read)
        .join(NotifiedUser, Notification.notification_id == NotifiedUser.notification_id)
        .filter(NotifiedUser.account_id == account_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    # append the has_read status, so that the frontend is able to get the
    # read status of each notification from the db
    notifications = []
    for notification, has_read in notif_list:
        notifications.append(
            {
                "notification_id": notification.notification_id,
                "message": notification.message,
                "created_at": notification.created_at,
                "has_read": has_read,
            }
        )

    return notifications
