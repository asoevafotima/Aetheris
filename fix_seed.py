"""Fix: publish all problems, add to contests, create promote helper."""
import sqlite3, json, urllib.request, urllib.error

DB   = "database.db"
BASE = "http://localhost:8000"

def db_fetchall(sql, params=()):
    conn = sqlite3.connect(DB)
    cur  = conn.cursor()
    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()
    return rows

def db_exec(sql, params=()):
    conn = sqlite3.connect(DB)
    cur  = conn.cursor()
    cur.execute(sql, params)
    conn.commit()
    conn.close()

def api(method, path, body=None, token=None):
    data    = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"  ERR {method} {path}: {e.code} {e.read().decode()[:100]}")
        return None

# --- login ---
rows = db_fetchall("SELECT email FROM users WHERE role='admin' LIMIT 1")
admin_email = rows[0][0]
tok = api("POST", "/auth/login", {"email": admin_email, "password": "Admin1234!"})
TOKEN = tok["access_token"]
print(f"Logged in: {admin_email}")

# --- publish all problems ---
problems = db_fetchall("SELECT id, title, slug, status FROM problems")
print(f"\nPublishing {len(problems)} problems...")
for pid, title, slug, status in problems:
    # UUID stored as hex without dashes - fix
    uid = f"{pid[:8]}-{pid[8:12]}-{pid[12:16]}-{pid[16:20]}-{pid[20:]}" if "-" not in str(pid) else pid
    r = api("PATCH", f"/problems/{uid}", {"status": "published"}, TOKEN)
    mark = "OK" if r else "FAIL"
    print(f"  [{mark}] {title}")

# --- get published problems ---
pub = db_fetchall("SELECT id, title FROM problems")
prob_ids = []
for pid, title in pub:
    uid = f"{pid[:8]}-{pid[8:12]}-{pid[12:16]}-{pid[16:20]}-{pid[20:]}" if "-" not in str(pid) else pid
    prob_ids.append((uid, title))
print(f"\n{len(prob_ids)} problems available")

# --- get contests ---
contests = db_fetchall("SELECT id, title FROM contests")
print(f"{len(contests)} contests found")

# --- add problems to contests ---
print("\nAdding problems to contests...")
labels = list("ABCDEFGHIJ")

for cid, ctitle in contests:
    uid_c = f"{cid[:8]}-{cid[8:12]}-{cid[12:16]}-{cid[16:20]}-{cid[20:]}" if "-" not in str(cid) else cid

    # Check how many problems already added
    existing = db_fetchall("SELECT COUNT(*) FROM contest_problems WHERE contest_id=?", (cid,))
    count = existing[0][0]
    if count > 0:
        print(f"  SKIP '{ctitle[:35]}' — already has {count} problems")
        continue

    # Assign first 4 problems to each contest
    added = 0
    for i, (pid, ptitle) in enumerate(prob_ids[:4]):
        result = api("POST", "/contest-problems/", {
            "contest_id": uid_c,
            "problem_id": pid,
            "label":      labels[i],
            "order_num":  i,
            "max_score":  100 + i * 50,
        }, TOKEN)
        if result:
            added += 1
    print(f"  OK  '{ctitle[:35]}' — {added} problems added (A-{labels[added-1]})")

print("\n" + "=" * 50)
print("ALL DONE!")
print()

p_count = db_fetchall("SELECT COUNT(*) FROM problems")[0][0]
c_count = db_fetchall("SELECT COUNT(*) FROM contests")[0][0]
cp_count = db_fetchall("SELECT COUNT(*) FROM contest_problems")[0][0]
tc_count = db_fetchall("SELECT COUNT(*) FROM test_cases")[0][0]

print(f"  Problems:         {p_count}")
print(f"  Test cases:       {tc_count}")
print(f"  Contests:         {c_count}")
print(f"  Contest problems: {cp_count}")
print()
print("Users:")
for uname, role, email in db_fetchall("SELECT username, role, email FROM users"):
    print(f"  {uname:20} {role:12} {email}")
