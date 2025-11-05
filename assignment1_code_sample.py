import os
from urllib.request import urlopen

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
    os.system(f'echo {body} | mail -s "{subject}" {to}')


# Proper syntax on endpoint URL and use secure hypertext transfer protocol
def get_data():
    url = "https://insecure-api.com/get-data"
    data = urlopen(url).read().decode()
    return data


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
