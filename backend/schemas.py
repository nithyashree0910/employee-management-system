from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(min_length=1, max_length=100)
    salary: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class EmployeeUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(min_length=1, max_length=100)
    salary: Decimal = Field(gt=0, max_digits=10, decimal_places=2)


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    department: str
    salary: Decimal