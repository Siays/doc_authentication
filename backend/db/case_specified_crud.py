from sqlalchemy.orm import Session, joinedload
from db.models.model_staff_system_acc import StaffSystemAcc


def get_full_name_by_account_id(db: Session, account_id: str) -> str:
    try:
        account_id = int(account_id)
    except ValueError:
        raise ValueError("Invalid account ID")

    acc_details = (
        db.query(StaffSystemAcc)
        .options(joinedload(StaffSystemAcc.staff))
        .filter(StaffSystemAcc.account_id == account_id)
        .first()
    )

    if not acc_details or not acc_details.staff:
        raise ValueError("Staff account not found.")

    return acc_details.staff.full_name
