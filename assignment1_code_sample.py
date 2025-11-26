import os

import pymysql
from dotenv import load_dotenv

# Store sensitive information in environment variables instead of hardcoding
load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


def get_user_input():
    user_input = input("Enter your name: ")
    return user_input


def send_email(to, subject, body):
    # Use subprocess.run with list arguments to avoid shell injection
    # Or use a proper email library like smtplib
    pass


# Proper syntax on endpoint URL and use secure hypertext transfer protocol
def get_data():
    # Use requests library with explicit HTTPS URL validation
    # to prevent file:// or other unsafe URL schemes
    pass


# Use parameterized queries to prevent SQL injection
def save_to_db(data):
    query = "INSERT INTO mytable (column1, column2) VALUES (%s, %s)"
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, (data, "Another Value"))
        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    user_input = get_user_input()
    data = get_data()
    save_to_db(data)
    send_email(os.getenv("ADMIN_EMAIL"), "User Input", user_input)
