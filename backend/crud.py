from sqlalchemy.orm import Session

from models import Employee
from schemas import EmployeeCreate, EmployeeUpdate


# CREATE
def create_employee(db: Session, employee: EmployeeCreate):
    new_employee = Employee(
        name=employee.name,
        email=str(employee.email),
        department=employee.department,
        salary=employee.salary,
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


# READ ALL
def get_employees(db: Session):
    return db.query(Employee).order_by(Employee.id).all()


# READ ONE
def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(
        Employee.id == employee_id
    ).first()


# UPDATE
def update_employee(
    db: Session,
    employee_id: int,
    employee_data: EmployeeUpdate,
):
    employee = get_employee(db, employee_id)

    if employee is None:
        return None

    employee.name = employee_data.name
    employee.email = str(employee_data.email)
    employee.department = employee_data.department
    employee.salary = employee_data.salary

    db.commit()
    db.refresh(employee)

    return employee


# DELETE
def delete_employee(db: Session, employee_id: int):
    employee = get_employee(db, employee_id)

    if employee is None:
        return None

    db.delete(employee)
    db.commit()

    return employee