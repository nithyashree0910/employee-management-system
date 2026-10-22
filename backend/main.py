from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Employee
from database import get_db
import crud
import schemas

app = FastAPI(
    title="Employee Management API",
    description="Employee CRUD application using FastAPI and MySQL",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to the Employee Management API!"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from exc


# CREATE
@app.post(
    "/employees",
    response_model=schemas.EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
):
    existing_employee = db.query(Employee).filter(
        Employee.email == str(employee.email)
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=409,
            detail="An employee with this email already exists",
        )

    return crud.create_employee(db, employee)


# READ ALL
@app.get(
    "/employees",
    response_model=list[schemas.EmployeeResponse],
)
def read_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)


# READ ONE
@app.get(
    "/employees/{employee_id}",
    response_model=schemas.EmployeeResponse,
)
def read_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = crud.get_employee(db, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee


# UPDATE
@app.put(
    "/employees/{employee_id}",
    response_model=schemas.EmployeeResponse,
)
def update_employee(
    employee_id: int,
    employee: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
):
    existing_employee = crud.get_employee(db, employee_id)

    if existing_employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    duplicate_email = db.query(Employee).filter(
        Employee.email == str(employee.email),
        Employee.id != employee_id,
    ).first()

    if duplicate_email:
        raise HTTPException(
            status_code=409,
            detail="Another employee already uses this email",
        )

    return crud.update_employee(db, employee_id, employee)


# DELETE
@app.delete("/employees/{employee_id}")
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = crud.delete_employee(db, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return {
        "message": "Employee deleted successfully",
        "employee_id": employee_id,
    }