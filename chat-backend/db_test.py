import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get the connection URL
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    connection = psycopg2.connect(DATABASE_URL)
    cursor = connection.cursor()
    cursor.execute("SELECT NOW();")
    print("Connection successful:", cursor.fetchone())
    cursor.close()
    connection.close()
except Exception as e:
    print(f"Failed to connect: {e}")
