from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, text

from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    department = Column(String(100), nullable=False)

    salary = Column(Numeric(10, 2), nullable=False)

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )