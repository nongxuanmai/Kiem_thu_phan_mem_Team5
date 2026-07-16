from database import init_database
import sqlite3

print("Initializing database...")
init_database()

conn = sqlite3.connect("fashionbag.db")
conn.row_factory = sqlite3.Row
count = conn.execute("SELECT COUNT(*) FROM SanPham").fetchone()[0]
print(f"Total products in DB now: {count}")
conn.close()
