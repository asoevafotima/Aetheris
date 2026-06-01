"""
Seed script: promotes users to roles, creates problems, test cases, and contests.
Run: python seed.py
"""
import sqlite3, json, urllib.request, urllib.error
from datetime import datetime, timedelta

DB = "database.db"
BASE = "http://localhost:8000"

# ─── helpers ────────────────────────────────────────────────────────────────

def db_exec(sql, params=()):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute(sql, params)
    conn.commit()
    conn.close()

def db_fetchall(sql, params=()):
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows

def api(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        msg = e.read().decode()
        print(f"  ⚠  {method} {path} → {e.code}: {msg[:120]}")
        return None

# ─── 1. Promote users ────────────────────────────────────────────────────────

print("\n=== 1. Roles ===")
rows = db_fetchall("SELECT username, role FROM users")
if not rows:
    print("  No users found — register at least one user first!")
else:
    for username, role in rows:
        print(f"  {username}: {role}")

    # Promote first user to admin
    first = rows[0][0]
    db_exec("UPDATE users SET role='admin' WHERE username=?", (first,))
    print(f"  ✓ {first} → admin")

    # Promote second (if exists) to moderator
    if len(rows) > 1:
        second = rows[1][0]
        db_exec("UPDATE users SET role='moderator' WHERE username=?", (second,))
        print(f"  ✓ {second} → moderator")

# ─── 2. Login as admin ───────────────────────────────────────────────────────

print("\n=== 2. Login ===")
rows2 = db_fetchall("SELECT email FROM users WHERE role='admin' LIMIT 1")
if not rows2:
    print("  No admin found, aborting.")
    exit(1)

admin_email = rows2[0][0]
print(f"  Logging in as {admin_email} ...")

# We don't know the password, so we reset it directly
import bcrypt
new_pass = "Admin1234!"
new_hash = bcrypt.hashpw(new_pass.encode(), bcrypt.gensalt()).decode()
db_exec("UPDATE users SET hashed_password=? WHERE email=?", (new_hash, admin_email))
print(f"  ✓ Password reset to: {new_pass}")

tok_data = api("POST", "/auth/login", {"email": admin_email, "password": new_pass})
if not tok_data:
    print("  Login failed")
    exit(1)
TOKEN = tok_data["access_token"]
print(f"  ✓ Token: {TOKEN[:30]}...")

# ─── 3. Problems ─────────────────────────────────────────────────────────────

PROBLEMS = [
    {
        "meta": {
            "title": "Two Sum",
            "description": (
                "Given an array of integers `nums` and an integer `target`, "
                "return indices of the two numbers such that they add up to `target`.\n\n"
                "You may assume that each input would have exactly one solution, "
                "and you may not use the same element twice."
            ),
            "input_format": "First line: integer n (size of array)\nSecond line: n integers\nThird line: integer target",
            "output_format": "Two space-separated indices (0-indexed)",
            "constraints": "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9",
            "difficulty": "easy",
            "time_limit_ms": 1000,
            "memory_limit_mb": 128,
        },
        "tests": [
            {"input": "4\n2 7 11 15\n9",       "output": "0 1", "sample": True,  "score": 30},
            {"input": "3\n3 2 4\n6",            "output": "1 2", "sample": True,  "score": 30},
            {"input": "6\n1 3 5 7 9 11\n10",    "output": "1 4", "sample": False, "score": 40},
        ],
    },
    {
        "meta": {
            "title": "Fibonacci Number",
            "description": (
                "The Fibonacci numbers form a sequence: F(0) = 0, F(1) = 1, "
                "F(n) = F(n-1) + F(n-2).\n\n"
                "Given n, calculate F(n)."
            ),
            "input_format": "A single integer n",
            "output_format": "A single integer — the n-th Fibonacci number",
            "constraints": "0 ≤ n ≤ 30",
            "difficulty": "easy",
            "time_limit_ms": 500,
            "memory_limit_mb": 64,
        },
        "tests": [
            {"input": "0",  "output": "0",   "sample": True,  "score": 25},
            {"input": "1",  "output": "1",   "sample": True,  "score": 25},
            {"input": "10", "output": "55",  "sample": False, "score": 25},
            {"input": "20", "output": "6765","sample": False, "score": 25},
        ],
    },
    {
        "meta": {
            "title": "Reverse a Linked List",
            "description": (
                "Given a sequence of n integers representing a linked list, "
                "reverse it and print the result."
            ),
            "input_format": "First line: integer n\nSecond line: n integers",
            "output_format": "n integers in reversed order, space-separated",
            "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9",
            "difficulty": "easy",
            "time_limit_ms": 1000,
            "memory_limit_mb": 128,
        },
        "tests": [
            {"input": "5\n1 2 3 4 5",    "output": "5 4 3 2 1", "sample": True,  "score": 50},
            {"input": "1\n42",            "output": "42",         "sample": True,  "score": 20},
            {"input": "4\n10 20 30 40",  "output": "40 30 20 10","sample": False, "score": 30},
        ],
    },
    {
        "meta": {
            "title": "Maximum Subarray",
            "description": (
                "Given an integer array `nums`, find the subarray with the largest sum, "
                "and return its sum.\n\n"
                "Use Kadane's algorithm for an O(n) solution."
            ),
            "input_format": "First line: integer n\nSecond line: n integers (can be negative)",
            "output_format": "A single integer — the maximum subarray sum",
            "constraints": "1 ≤ n ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4",
            "difficulty": "medium",
            "time_limit_ms": 1500,
            "memory_limit_mb": 128,
        },
        "tests": [
            {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "output": "6",  "sample": True,  "score": 30},
            {"input": "1\n1",                        "output": "1",  "sample": True,  "score": 20},
            {"input": "5\n5 4 -1 7 8",              "output": "23", "sample": False, "score": 25},
            {"input": "4\n-3 -1 -2 -4",             "output": "-1", "sample": False, "score": 25},
        ],
    },
    {
        "meta": {
            "title": "Binary Search",
            "description": (
                "Given a sorted array of n distinct integers and a target value, "
                "return the index of target if found, or -1 if not found.\n\n"
                "Your solution must run in O(log n) time."
            ),
            "input_format": "First line: integer n\nSecond line: n integers (sorted ascending)\nThird line: integer target",
            "output_format": "Index of target (0-based) or -1",
            "constraints": "1 ≤ n ≤ 10^6\n-10^9 ≤ nums[i] ≤ 10^9\nAll elements are distinct",
            "difficulty": "easy",
            "time_limit_ms": 500,
            "memory_limit_mb": 128,
        },
        "tests": [
            {"input": "6\n-1 0 3 5 9 12\n9",  "output": "4",  "sample": True,  "score": 30},
            {"input": "6\n-1 0 3 5 9 12\n2",  "output": "-1", "sample": True,  "score": 30},
            {"input": "5\n1 3 5 7 9\n7",      "output": "3",  "sample": False, "score": 40},
        ],
    },
    {
        "meta": {
            "title": "Valid Parentheses",
            "description": (
                "Given a string containing only '(', ')', '{', '}', '[', ']', "
                "determine if the input string is valid.\n\n"
                "A string is valid if:\n"
                "- Open brackets must be closed by the same type of brackets.\n"
                "- Open brackets must be closed in the correct order."
            ),
            "input_format": "A single line containing the bracket string",
            "output_format": "YES or NO",
            "constraints": "1 ≤ |s| ≤ 10^4\ns consists only of ()[]{}",
            "difficulty": "easy",
            "time_limit_ms": 500,
            "memory_limit_mb": 64,
        },
        "tests": [
            {"input": "()",        "output": "YES", "sample": True,  "score": 25},
            {"input": "()[]{}",    "output": "YES", "sample": True,  "score": 25},
            {"input": "(]",        "output": "NO",  "sample": False, "score": 25},
            {"input": "([)]",      "output": "NO",  "sample": False, "score": 25},
        ],
    },
    {
        "meta": {
            "title": "Longest Common Subsequence",
            "description": (
                "Given two strings `text1` and `text2`, return the length of their "
                "longest common subsequence.\n\n"
                "A subsequence is a sequence derived from a string by deleting some "
                "characters without changing the relative order."
            ),
            "input_format": "First line: string text1\nSecond line: string text2",
            "output_format": "A single integer — length of LCS",
            "constraints": "1 ≤ |text1|, |text2| ≤ 1000\nStrings consist of lowercase letters only",
            "difficulty": "medium",
            "time_limit_ms": 2000,
            "memory_limit_mb": 256,
        },
        "tests": [
            {"input": "abcde\nace",    "output": "3", "sample": True,  "score": 30},
            {"input": "abc\nabc",      "output": "3", "sample": True,  "score": 30},
            {"input": "abc\ndef",      "output": "0", "sample": False, "score": 20},
            {"input": "oxcpqrsvwf\nshmtulqrypy", "output": "2", "sample": False, "score": 20},
        ],
    },
    {
        "meta": {
            "title": "Merge Sort",
            "description": (
                "Implement the merge sort algorithm and sort an array of n integers "
                "in ascending order."
            ),
            "input_format": "First line: integer n\nSecond line: n space-separated integers",
            "output_format": "n integers sorted in ascending order, space-separated",
            "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9",
            "difficulty": "medium",
            "time_limit_ms": 2000,
            "memory_limit_mb": 256,
        },
        "tests": [
            {"input": "5\n5 3 1 4 2",      "output": "1 2 3 4 5",         "sample": True,  "score": 30},
            {"input": "1\n42",              "output": "42",                 "sample": True,  "score": 20},
            {"input": "8\n8 7 6 5 4 3 2 1","output": "1 2 3 4 5 6 7 8",   "sample": False, "score": 30},
            {"input": "3\n-3 0 3",          "output": "-3 0 3",             "sample": False, "score": 20},
        ],
    },
    {
        "meta": {
            "title": "N-th Prime Number",
            "description": (
                "Given n, find the n-th prime number.\n\n"
                "Prime numbers: 2, 3, 5, 7, 11, 13, ..."
            ),
            "input_format": "A single integer n",
            "output_format": "The n-th prime number",
            "constraints": "1 ≤ n ≤ 10^4",
            "difficulty": "medium",
            "time_limit_ms": 2000,
            "memory_limit_mb": 128,
        },
        "tests": [
            {"input": "1",    "output": "2",      "sample": True,  "score": 25},
            {"input": "6",    "output": "13",     "sample": True,  "score": 25},
            {"input": "100",  "output": "541",    "sample": False, "score": 25},
            {"input": "1000", "output": "7919",   "sample": False, "score": 25},
        ],
    },
    {
        "meta": {
            "title": "Graph BFS — Shortest Path",
            "description": (
                "Given an unweighted undirected graph with n vertices and m edges, "
                "find the shortest path (in edges) from vertex 1 to vertex n.\n\n"
                "If no path exists, print -1."
            ),
            "input_format": "First line: integers n m\nNext m lines: pairs u v (edge between u and v)\nLast line: integers s t (source and target)",
            "output_format": "Shortest path length or -1",
            "constraints": "1 ≤ n ≤ 10^5\n0 ≤ m ≤ 2×10^5\n1 ≤ u, v ≤ n",
            "difficulty": "hard",
            "time_limit_ms": 2000,
            "memory_limit_mb": 256,
        },
        "tests": [
            {"input": "4 4\n1 2\n2 3\n3 4\n1 4\n1 4", "output": "1", "sample": True,  "score": 30},
            {"input": "3 1\n1 2\n1 3",                 "output": "-1","sample": True,  "score": 30},
            {"input": "6 7\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n2 6\n1 6","output": "3","sample": False, "score": 40},
        ],
    },
]

print("\n=== 3. Creating problems ===")
created_problem_ids = []

for p in PROBLEMS:
    result = api("POST", "/problems/", p["meta"], TOKEN)
    if result:
        pid = result["id"]
        created_problem_ids.append(pid)
        print(f"  ✓ [{result['difficulty'].upper():6}] {result['title']} → {pid[:8]}…")

        # Publish it
        api("PATCH", f"/problems/{pid}", {"status": "published"}, TOKEN)

        # Add test cases
        for i, tc in enumerate(p["tests"]):
            api("POST", "/test-cases/", {
                "problem_id": pid,
                "input_data": tc["input"],
                "expected_output": tc["output"],
                "is_sample": tc["sample"],
                "order_num": i,
                "score": tc["score"],
            }, TOKEN)
        print(f"       {len(p['tests'])} test cases added")
    else:
        print(f"  ✗ Failed: {p['meta']['title']} (maybe already exists)")

# ─── 4. Contests ─────────────────────────────────────────────────────────────

now = datetime.utcnow()

CONTESTS = [
    {
        "title": "Weekly Round #1 — Beginner",
        "description": "Perfect for newcomers! Easy problems to get you started with competitive programming.",
        "starts_at": (now + timedelta(hours=2)).isoformat(),
        "ends_at":   (now + timedelta(hours=4)).isoformat(),
        "is_public": True,
    },
    {
        "title": "Codeforce Killer — Div. 2",
        "description": "Medium difficulty round. Master classic algorithms and data structures.",
        "starts_at": (now - timedelta(minutes=30)).isoformat(),
        "ends_at":   (now + timedelta(hours=1, minutes=30)).isoformat(),
        "is_public": True,
    },
    {
        "title": "Algorithm Masters Cup",
        "description": "The hardest monthly challenge. Only for the elite coders. Graph algorithms, DP, advanced data structures.",
        "starts_at": (now + timedelta(days=3)).isoformat(),
        "ends_at":   (now + timedelta(days=3, hours=5)).isoformat(),
        "is_public": True,
    },
    {
        "title": "DP Marathon",
        "description": "A weekend-long contest focused entirely on Dynamic Programming. 8 problems, all DP.",
        "starts_at": (now + timedelta(days=7)).isoformat(),
        "ends_at":   (now + timedelta(days=7, hours=3)).isoformat(),
        "is_public": True,
    },
    {
        "title": "Past Round — Div. 3 Archive",
        "description": "Practice with problems from a previous contest round.",
        "starts_at": (now - timedelta(days=2)).isoformat(),
        "ends_at":   (now - timedelta(days=2, hours=-3)).isoformat(),
        "is_public": True,
    },
]

print("\n=== 4. Creating contests ===")
created_contests = []

for c in CONTESTS:
    result = api("POST", "/contests/", c, TOKEN)
    if result:
        created_contests.append(result)
        print(f"  ✓ {result['title']} → {result['id'][:8]}…")
    else:
        print(f"  ✗ Failed: {c['title']}")

# Add problems to contests
if created_problem_ids and created_contests:
    print("\n=== 5. Adding problems to contests ===")
    for ci, contest in enumerate(created_contests):
        # Add 3-5 problems per contest depending on difficulty level
        probs_to_add = created_problem_ids[:4] if ci < 2 else created_problem_ids[3:7]
        for order, pid in enumerate(probs_to_add):
            api("POST", "/contest-problems/", {
                "contest_id": contest["id"],
                "problem_id": pid,
                "order_num": order,
                "points": 100 * (order + 1),
            }, TOKEN)
        print(f"  ✓ {contest['title'][:40]}… — {len(probs_to_add)} problems")

# ─── Summary ─────────────────────────────────────────────────────────────────

print("\n" + "="*50)
print("DONE!")
print(f"  Problems created: {len(created_problem_ids)}/{len(PROBLEMS)}")
print(f"  Contests created: {len(created_contests)}/{len(CONTESTS)}")
print()
print("HOW ROLES WORK:")
print("  admin     → can create/delete problems, contests, manage everything")
print("  moderator → can create problems, contests, but not delete users")
print("  user      → regular competitor")
print()
print("TO PROMOTE A USER:")
print("  python promote.py <username> <admin|moderator|user>")
print()
rows_final = db_fetchall("SELECT username, role FROM users")
print("Current users:")
for u, r in rows_final:
    print(f"  {u:20} → {r}")
