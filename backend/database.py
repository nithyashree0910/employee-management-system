import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from the root .env file
load_dotenv()

# Read database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "employee_management")

if DB_PASSWORD is None:
    raise RuntimeError("DB_PASSWORD is missing from the .env file")

# Build the MySQL connection URL safely
from sqlalchemy.engine import URL

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
)

# Create the database engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for database models
Base = declarative_base()


# Provide a database session to API endpoints
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()