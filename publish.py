import sqlite3
conn = sqlite3.connect("database.db")
cur  = conn.cursor()

cur.execute("UPDATE problems SET status='published'")
conn.commit()

cur.execute("SELECT title, status FROM problems")
rows = cur.fetchall()
print(f"Published {len(rows)} problems:")
for title, status in rows:
    print(f"  [{status}] {title}")

# Also check test cases per problem
cur.execute("""
    SELECT p.title, COUNT(tc.id) as tc_count
    FROM problems p
    LEFT JOIN test_cases tc ON tc.problem_id = p.id
    GROUP BY p.id, p.title
""")
print("\nTest cases:")
for title, count in cur.fetchall():
    print(f"  {count:2d} tests — {title}")

conn.close()
print("\nDone!")
