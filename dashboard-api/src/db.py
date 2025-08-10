import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="kat",
  password="",
  database="discord_bot_db"
)

cursor = mydb.cursor()