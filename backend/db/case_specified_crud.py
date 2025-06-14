from sqlalchemy.orm import Session
from db.models.model_owner import Owner
from db.models.model_staff_system_acc import StaffSystemAcc


def get_full_name_by_account_id(db: Session, account_id: str) -> str:
    try:
        account_id = int(account_id)
    except ValueError:
        raise ValueError("Invalid account ID")

    acc_details = (
        db.query(StaffSystemAcc)
        .filter(StaffSystemAcc.account_id == account_id)
        .first()
    )

    if not acc_details or not acc_details.staff:
        raise ValueError("Staff account not found.")

    return acc_details.staff.full_name


def get_owner_full_name(db: Session, ic_no: str) -> str:
    owner_details = db.query(Owner).filter(Owner.owner_ic_no == ic_no).first()

    if not owner_details:
        raise ValueError("Provided IC does not exist in owner records.")

    return owner_details.full_name


