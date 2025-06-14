from sqlalchemy import Column, String, Date, Boolean, Enum as SqlEnum, BigInteger
import enum
from ..database import Base

# Define the valid gender values
class GenderEnum(str, enum.Enum):
    male = "Male"
    female = "Female"

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(BigInteger, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    ic_no = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(SqlEnum(GenderEnum, name="gender_enum", values_callable=lambda x: [e.value for e in x]), nullable=False)
    job_title = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)

    @property
    def full_name(self) -> str:
        """Get staff member's full name."""
        return f"{self.first_name} {self.last_name}"
