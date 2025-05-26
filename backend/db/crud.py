from sqlalchemy.orm import Session, InstrumentedAttribute
from typing import Type, TypeVar, Any, Dict, List, Optional

T = TypeVar('T')

def create(db: Session, model: Type[T], obj_in: Dict[str, Any]) -> T:
    """
    Create a new record in the database for the given model.

    Parameters:
        db (Session): SQLAlchemy database session.
        model (Type[T]): The SQLAlchemy model class.
        obj_in (Dict[str, Any]): Dictionary of fields/values for the new record.

    Returns:
        T: The created model instance (with refreshed state from DB).
    """
    db_obj = model(**obj_in)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get(db: Session, model: Type[T], obj_id: Any) -> Optional[T]:
    """
    Retrieve a single record by its primary key.

    Parameters:
        db (Session): SQLAlchemy database session.
        model (Type[T]): The SQLAlchemy model class.
        obj_id (Any): The primary key value of the record.

    Returns:
        Optional[T]: The model instance if found, else None.
    """
    return db.query(model).get(obj_id)


def get_by_column(db: Session, model: Type[T], column_name: str, value: Any) -> Optional[T]:
    column_attr = getattr(model, column_name, None)
    if not isinstance(column_attr, InstrumentedAttribute):
        raise ValueError(f"{column_name} is not a valid column of {model.__name__}")
    return db.query(model).filter(column_attr == value).first()


def get_multi(db: Session, model: Type[T], skip: int = 0, limit: int = 100) -> List[T]:
    """
    Retrieve multiple records from the database with pagination.

    Parameters:
        db (Session): SQLAlchemy database session.
        model (Type[T]): The SQLAlchemy model class.
        skip (int): Number of records to skip (for pagination).
        limit (int): Maximum number of records to return.

    Returns:
        List[T]: List of model instances.
    """
    return db.query(model).offset(skip).limit(limit).all()

def update(db: Session, db_obj: T, obj_in: Dict[str, Any]) -> T:
    """
    Update an existing record in the database.

    Parameters:
        db (Session): SQLAlchemy database session.
        db_obj (T): The existing model instance to update.
        obj_in (Dict[str, Any]): Dictionary of fields/values to update.

    Returns:
        T: The updated model instance (with refreshed state from DB).
    """
    for field, value in obj_in.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, model: Type[T], obj_id: Any) -> Optional[T]:
    """
    Delete a record from the database by its primary key.

    Parameters:
        db (Session): SQLAlchemy database session.
        model (Type[T]): The SQLAlchemy model class.
        obj_id (Any): The primary key value of the record to delete.

    Returns:
        Optional[T]: The deleted model instance if found and deleted, else None.
    """
    obj = db.query(model).get(obj_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj 