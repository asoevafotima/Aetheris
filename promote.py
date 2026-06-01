"""
Usage:
  python promote.py <username> <admin|moderator|user>
  python promote.py --list
"""
import sys
import sqlite3

DB = "database.db"

def get_users():
    conn = sqlite3.connect(DB)
    cur  = conn.cursor()
    cur.execute("SELECT username, role, email FROM users ORDER BY role, username")
    rows = cur.fetchall()
    conn.close()
    return rows

def promote(username: str, role: str):
    valid_roles = ("admin", "moderator", "user")
    if role not in valid_roles:
        print(f"Invalid role '{role}'. Choose: {', '.join(valid_roles)}")
        sys.exit(1)

    conn = sqlite3.connect(DB)
    cur  = conn.cursor()
    cur.execute("SELECT username, role FROM users WHERE username=?", (username,))
    row = cur.fetchone()
    if not row:
        print(f"User '{username}' not found.")
        cur.execute("SELECT username FROM users")
        all_users = [r[0] for r in cur.fetchall()]
        print(f"Available users: {', '.join(all_users)}")
        conn.close()
        sys.exit(1)

    old_role = row[1]
    cur.execute("UPDATE users SET role=? WHERE username=?", (role, username))
    conn.commit()
    conn.close()
    print(f"[OK] {username}: {old_role} -> {role}")

def main():
    if len(sys.argv) < 2 or sys.argv[1] == "--list":
        users = get_users()
        print(f"\n{'Username':25} {'Role':12} {'Email'}")
        print("-" * 60)
        for uname, role, email in users:
            marker = " <-- admin" if role == "admin" else (" <-- mod" if role == "moderator" else "")
            print(f"  {uname:23} {role:12} {email}{marker}")
        print()
        print("Usage: python promote.py <username> <admin|moderator|user>")
        return

    if len(sys.argv) < 3:
        print("Usage: python promote.py <username> <admin|moderator|user>")
        sys.exit(1)

    promote(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    main()
