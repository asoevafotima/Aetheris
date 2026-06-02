"""
Seed script: создаёт задачи с difficulty_code и темами, 3 контеста.
Запуск: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, Base, engine

import auth.models
import users.models
import user_profiles.models
import user_settings.models
import problems.models
import problem_tags.models
import problem_tag_map.models
import test_cases.models
import editorial.models
import submissions.models
import submission_results.models
import contests.models
import contest_problems.models
import contest_participants.models
import contest_standings.models
import duels.models
import duel_invitations.models
import duel_ratings.models
import teams.models
import team_members.models
import team_contests.models
import achievements.models
import user_achievements.models
import ratings.models
import notifications.models
import chat_messages.models
import follows.models
import problem_bookmarks.models
import user_weak_topics.models
import ai_analysis.models
import ai_hints.models
import algorithm_visualizations.models
import training_plans.models
import training_plan_items.models
import audit_logs.models

Base.metadata.create_all(bind=engine)

from datetime import datetime, timedelta
from slugify import slugify
import bcrypt

from contests.models import Contest, ContestType, ContestStatus
from contest_problems.models import ContestProblem
from problems.models import Problem, Difficulty, ProblemStatus
from problem_tags.models import ProblemTag
from problem_tag_map.models import ProblemTagMap
from test_cases.models import TestCase
from users.models import User, UserRole

db = SessionLocal()

# ── 1. Удаляем все существующие контесты ──────────────────────────
print("Удаляю существующие контесты...")
db.query(ContestProblem).delete()
db.query(Contest).delete()
db.commit()
print("  Готово.")

# ── 2. Получаем или создаём admin-пользователя ────────────────────
admin = db.query(User).filter(User.role == UserRole.admin).first()
if not admin:
    admin = db.query(User).first()
if not admin:
    admin = User(
        username="admin",
        email="admin@aetheris.io",
        hashed_password=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(),
        role=UserRole.admin,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"  Создан admin: admin@aetheris.io / admin123")
else:
    admin.role = UserRole.admin
    db.commit()

admin_id = admin.id
print(f"  Используем admin: {admin.username} ({admin.email})")

# ── 3. Создаём/обновляем теги тем ─────────────────────────────────
TAGS_DATA = [
    {"name": "Массивы",                    "slug": "arrays",      "color": "#3b82f6"},
    {"name": "Математика",                 "slug": "math",        "color": "#10b981"},
    {"name": "Строки",                     "slug": "strings",     "color": "#f59e0b"},
    {"name": "Сортировка",                 "slug": "sorting",     "color": "#eab308"},
    {"name": "Графы",                      "slug": "graphs",      "color": "#8b5cf6"},
    {"name": "Динамическое программирование", "slug": "dp",        "color": "#ef4444"},
    {"name": "Ввод/Вывод",                 "slug": "io",          "color": "#6b7280"},
    {"name": "Геометрия",                  "slug": "geometry",    "color": "#14b8a6"},
    {"name": "Деревья",                    "slug": "trees",       "color": "#a16207"},
    {"name": "Структуры данных",           "slug": "data-structures", "color": "#6366f1"},
]

print("\nСоздаю теги тем...")
tags_by_slug = {}
for tdata in TAGS_DATA:
    existing = db.query(ProblemTag).filter(ProblemTag.slug == tdata["slug"]).first()
    if existing:
        existing.name = tdata["name"]
        existing.color = tdata["color"]
        tags_by_slug[tdata["slug"]] = existing
        print(f"  = {tdata['name']} (обновлён)")
    else:
        tag = ProblemTag(**tdata)
        db.add(tag)
        db.flush()
        tags_by_slug[tdata["slug"]] = tag
        print(f"  + {tdata['name']}")
db.commit()

# ── 4. Создаём/обновляем 9 задач ──────────────────────────────────
PROBLEMS_DATA = [
    {
        "title": "Сумма двух чисел",
        "difficulty_code": "A",
        "topics": ["math", "io"],
        "description": "Дано два целых числа A и B. Найдите их сумму.",
        "input_format": "Два целых числа A и B на одной строке, разделённые пробелом.",
        "output_format": "Одно целое число — сумма A и B.",
        "constraints": "−10⁹ ≤ A, B ≤ 10⁹",
        "difficulty": Difficulty.easy,
        "time_limit_ms": 1000,
        "memory_limit_mb": 256,
        "samples": [("3 5", "8"), ("-1 1", "0")],
    },
    {
        "title": "Максимум в массиве",
        "difficulty_code": "A1",
        "topics": ["arrays"],
        "description": "Дан массив из N целых чисел. Найдите максимальный элемент.",
        "input_format": "Первая строка содержит N. Вторая строка — N целых чисел.",
        "output_format": "Одно целое число — максимальный элемент массива.",
        "constraints": "1 ≤ N ≤ 10⁵, −10⁹ ≤ aᵢ ≤ 10⁹",
        "difficulty": Difficulty.easy,
        "time_limit_ms": 1000,
        "memory_limit_mb": 256,
        "samples": [("5\n3 1 4 1 5", "5"), ("3\n-1 -2 -3", "-1")],
    },
    {
        "title": "Проверка на палиндром",
        "difficulty_code": "B",
        "topics": ["strings"],
        "description": "Дана строка. Определите, является ли она палиндромом.",
        "input_format": "Одна строка из строчных латинских букв.",
        "output_format": "Выведите YES если строка палиндром, иначе NO.",
        "constraints": "1 ≤ |s| ≤ 10⁵",
        "difficulty": Difficulty.easy,
        "time_limit_ms": 1000,
        "memory_limit_mb": 256,
        "samples": [("racecar", "YES"), ("hello", "NO")],
    },
    {
        "title": "Бинарный поиск",
        "difficulty_code": "B1",
        "topics": ["arrays", "sorting"],
        "description": (
            "Дан отсортированный массив из N чисел и Q запросов. "
            "Для каждого запроса найдите позицию числа X в массиве (1-индексация) "
            "или -1 если его нет."
        ),
        "input_format": "Первая строка: N Q. Вторая строка: N чисел. Следующие Q строк: одно число X.",
        "output_format": "Для каждого запроса выведите позицию или -1.",
        "constraints": "1 ≤ N, Q ≤ 10⁵, −10⁹ ≤ aᵢ, X ≤ 10⁹",
        "difficulty": Difficulty.medium,
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "samples": [("5 2\n1 3 5 7 9\n5\n4", "3\n-1")],
    },
    {
        "title": "Число Фибоначчи",
        "difficulty_code": "C",
        "topics": ["math", "dp"],
        "description": "Найдите N-е число Фибоначчи по модулю 10⁹+7. F(1)=1, F(2)=1.",
        "input_format": "Одно целое число N.",
        "output_format": "N-е число Фибоначчи по модулю 10⁹+7.",
        "constraints": "1 ≤ N ≤ 10¹⁸",
        "difficulty": Difficulty.medium,
        "time_limit_ms": 2000,
        "memory_limit_mb": 256,
        "samples": [("6", "8"), ("10", "55")],
    },
    {
        "title": "Обход графа BFS",
        "difficulty_code": "C1",
        "topics": ["graphs"],
        "description": (
            "Дан ориентированный граф из N вершин и M рёбер. "
            "Найдите кратчайшее расстояние от вершины 1 до всех остальных."
        ),
        "input_format": "Первая строка: N M. Следующие M строк: u v.",
        "output_format": "N чисел — расстояния от вершины 1. -1 если недостижимо.",
        "constraints": "1 ≤ N ≤ 10⁵, 0 ≤ M ≤ 2·10⁵",
        "difficulty": Difficulty.medium,
        "time_limit_ms": 3000,
        "memory_limit_mb": 512,
        "samples": [("4 4\n1 2\n1 3\n2 4\n3 4", "0 1 1 2")],
    },
    {
        "title": "Наибольшая общая подпоследовательность",
        "difficulty_code": "D",
        "topics": ["dp", "strings"],
        "description": "Даны две строки A и B. Найдите длину их наибольшей общей подпоследовательности (LCS).",
        "input_format": "Две строки A и B, каждая на отдельной строке.",
        "output_format": "Длина LCS.",
        "constraints": "1 ≤ |A|, |B| ≤ 1000",
        "difficulty": Difficulty.hard,
        "time_limit_ms": 3000,
        "memory_limit_mb": 512,
        "samples": [("abcde\nace", "3"), ("abc\nabc", "3")],
    },
    {
        "title": "Дерево отрезков",
        "difficulty_code": "D1",
        "topics": ["trees", "data-structures"],
        "description": (
            "Реализуйте структуру данных для точечного обновления "
            "и запроса суммы на отрезке массива."
        ),
        "input_format": (
            "Первая строка: N Q. Вторая строка: N чисел. "
            "Следующие Q строк: '1 i x' (a[i]=x) или '2 l r' (сумма a[l..r])."
        ),
        "output_format": "Для каждого запроса типа 2 выведите ответ.",
        "constraints": "1 ≤ N, Q ≤ 10⁵, −10⁹ ≤ aᵢ, x ≤ 10⁹",
        "difficulty": Difficulty.hard,
        "time_limit_ms": 3000,
        "memory_limit_mb": 512,
        "samples": [("5 4\n1 2 3 4 5\n2 1 3\n1 2 10\n2 1 3\n2 1 5", "6\n14\n23")],
    },
    {
        "title": "Выпуклая оболочка",
        "difficulty_code": "E",
        "topics": ["geometry", "math"],
        "description": "Даны N точек на плоскости. Найдите периметр их выпуклой оболочки.",
        "input_format": "Первая строка: N. Следующие N строк: x y.",
        "output_format": "Периметр с точностью до 6 знаков после запятой.",
        "constraints": "3 ≤ N ≤ 10⁵, −10⁹ ≤ x, y ≤ 10⁹",
        "difficulty": Difficulty.expert,
        "time_limit_ms": 5000,
        "memory_limit_mb": 512,
        "samples": [("4\n0 0\n1 0\n0 1\n1 1", "4.000000")],
    },
]

print("\nСоздаю задачи...")
created_problems = []
for pdata in PROBLEMS_DATA:
    slug = slugify(pdata["title"])
    topics = pdata.pop("topics")
    difficulty_code = pdata.pop("difficulty_code")

    existing = db.query(Problem).filter(Problem.slug == slug).first()
    if existing:
        existing.difficulty_code = difficulty_code
        created_problems.append(existing)
        problem = existing
        print(f"  = {pdata['title']} (обновлён, код={difficulty_code})")
    else:
        samples = pdata.pop("samples")
        problem = Problem(
            title=pdata["title"],
            slug=slug,
            description=pdata["description"],
            input_format=pdata["input_format"],
            output_format=pdata["output_format"],
            constraints=pdata["constraints"],
            difficulty=pdata["difficulty"],
            difficulty_code=difficulty_code,
            status=ProblemStatus.published,
            time_limit_ms=pdata["time_limit_ms"],
            memory_limit_mb=pdata["memory_limit_mb"],
            author_id=admin_id,
            is_public=True,
        )
        db.add(problem)
        db.flush()

        for i, (inp, out) in enumerate(samples):
            tc = TestCase(
                problem_id=problem.id,
                input_data=inp,
                expected_output=out,
                is_sample=True,
                order_num=i,
                score=1,
            )
            db.add(tc)

        created_problems.append(problem)
        print(f"  + {pdata['title']} (код={difficulty_code})")

    db.flush()

    # Привязываем темы
    for slug_tag in topics:
        tag = tags_by_slug.get(slug_tag)
        if not tag:
            continue
        already = db.query(ProblemTagMap).filter(
            ProblemTagMap.problem_id == problem.id,
            ProblemTagMap.tag_id == tag.id,
        ).first()
        if not already:
            db.add(ProblemTagMap(problem_id=problem.id, tag_id=tag.id))

db.commit()

# ── 5. Создаём 3 контеста ─────────────────────────────────────────
now = datetime.utcnow()

CONTESTS = [
    {
        "title": "Aetheris Round #1 (Div. 2)",
        "slug": "aetheris-round-1-div-2",
        "description": "Первый рейтинговый раунд Aetheris. Задачи для начинающих — уровень A–B.",
        "contest_type": ContestType.rated,
        "status": ContestStatus.running,
        "starts_at": now - timedelta(hours=1),
        "ends_at": now + timedelta(hours=2),
        "problems_idx": [0, 1, 2],
    },
    {
        "title": "Aetheris Round #2 (Div. 1)",
        "slug": "aetheris-round-2-div-1",
        "description": "Второй раунд для опытных участников. 5 задач: от B1 до D1.",
        "contest_type": ContestType.rated,
        "status": ContestStatus.upcoming,
        "starts_at": now + timedelta(days=2),
        "ends_at": now + timedelta(days=2, hours=3),
        "problems_idx": [3, 4, 5, 6, 7],
    },
    {
        "title": "Educational Round #1",
        "slug": "educational-round-1",
        "description": "Образовательный раунд — рейтинг не изменяется. Практика алгоритмов.",
        "contest_type": ContestType.unrated,
        "status": ContestStatus.upcoming,
        "starts_at": now + timedelta(days=5),
        "ends_at": now + timedelta(days=5, hours=4),
        "problems_idx": [0, 2, 4, 6, 7, 8],
    },
]

print("\nСоздаю контесты...")
for cdata in CONTESTS:
    problems_idx = cdata.pop("problems_idx")

    contest = Contest(
        title=cdata["title"],
        slug=cdata["slug"],
        description=cdata["description"],
        contest_type=cdata["contest_type"],
        status=cdata["status"],
        starts_at=cdata["starts_at"],
        ends_at=cdata["ends_at"],
        author_id=admin_id,
        is_public=True,
    )
    db.add(contest)
    db.flush()

    for order, idx in enumerate(problems_idx):
        if idx < len(created_problems):
            cp = ContestProblem(
                contest_id=contest.id,
                problem_id=created_problems[idx].id,
                label=chr(65 + order),
                order_num=order,
                max_score=100,
            )
            db.add(cp)

    cnt = len([i for i in problems_idx if i < len(created_problems)])
    status_label = {"running": "ИДЁТ", "upcoming": "Предстоящий", "finished": "Завершён"}.get(
        contest.status.value, contest.status.value
    )
    print(f"  + [{status_label}] {contest.title} — {cnt} задач")

db.commit()
db.close()

print("\n" + "="*55)
print("Готово!")
print(f"  Задачи: {len(created_problems)}")
print(f"  Теги:   {len(TAGS_DATA)}")
print(f"  Контесты: {len(CONTESTS)}")
print()
print("Для входа как администратор:")
print("  Email: admin@aetheris.io")
print("  Пароль: admin123")
print("="*55)
