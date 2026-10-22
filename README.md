# Employee Management System

A full-stack Employee Management System built using Python, FastAPI, MySQL, HTML, CSS, and JavaScript.

## Features

* Add new employees
* View all employees
* Update employee details
* Delete employees
* Search employees
* Filter employees by department
* View dashboard statistics
* Store employee data in MySQL

## Technologies Used

* **Backend:** Python, FastAPI
* **Database:** MySQL
* **Database Integration:** SQLAlchemy
* **Frontend:** HTML, CSS, JavaScript
* **API Documentation:** FastAPI Swagger UI

## Project Structure

```text
employee_management/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── crud.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Prerequisites

* Python 3.10 or a compatible version
* MySQL Server
* Git
* A modern web browser

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/employee-management-system.git
cd employee-management-system
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a local `.env` file by copying `.env.example`.

On Windows Command Prompt:

```cmd
copy .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local MySQL credentials.

**Never commit your actual `.env` file or database passwords to GitHub.**

### 5. Create the database

Open MySQL and execute:

```sql
CREATE DATABASE employee_management;
```

Ensure the MySQL user configured in `.env` has permission to access this database.

Create the `employees` table according to the model in `backend/models.py` if your application does not create it automatically.

### 6. Start the backend

Open a terminal in the project root:

```bash
cd backend
python -m uvicorn main:app --reload
```

The API should be available at:

```text
http://127.0.0.1:8000
```

### 7. Open the frontend

Open `frontend/index.html` using the VS Code Live Server extension.

Ensure the backend is running and the frontend API URL matches your local backend.

### 8. Explore the API

Open the following address in your browser:

```text
http://127.0.0.1:8000/docs
```

This opens the interactive Swagger UI for testing the API endpoints.
