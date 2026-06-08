<div align="center">

# ⚡ Aetheris

### Олимпиадная платформа нового поколения для спортивного программирования

Полноценный аналог Codeforces / LeetCode со **своим судьёй**, контестами, дуэлями 1 на 1, командами, рейтингом и AI-наставником.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## 📖 О проекте

**Aetheris** (внутреннее имя — *CodeArena*) — это веб-платформа для проведения олимпиад по программированию и подготовки к ним. Пользователи решают задачи на нескольких языках, участвуют в контестах с живой турнирной таблицей, вызывают друг друга на дуэли, объединяются в команды и поднимаются в рейтинге.

Ключевая особенность — **собственный судья (judge)**: платформа реально компилирует и запускает присланный код, прогоняет его через тесты, замеряет время и выносит вердикт, как настоящие соревновательные системы.

---

## ✨ Возможности

| Раздел | Описание |
|---|---|
| 🧩 **Задачи** | Каталог задач по темам и сложности, фильтры, закладки, условие + примеры |
| ⚖️ **Судья** | Запуск решений на **Python, C++, C, JavaScript** с проверкой по тест-кейсам |
| 🏆 **Контесты** | Соревнования с живой таблицей по системе **ICPC** (баллы + штрафное время) |
| ⚔️ **Дуэли** | Битвы 1 на 1 — случайная задача, кто решит быстрее, тот и победил |
| 👥 **Команды** | Создание команд, приглашения, участие в командных олимпиадах |
| 📊 **Рейтинг** | Глобальный лидерборд, история изменения рейтинга по контестам |
| 🤖 **AI-наставник** | Подсказки и разбор ошибок через **Groq (Llama 3.3 70B)** — объясняет, но не даёт готовый код |
| 📚 **Тренировки** | Учебные планы с автоотметкой решённых задач |
| 💬 **Чат** | Реалтайм-чат в контестах и дуэлях через **WebSocket** |
| 🔔 **Соц. функции** | Уведомления, подписки на пользователей, профили, достижения |
| 🌍 **Интерфейс** | Светлая/тёмная тема, **20 языков** интерфейса |

---

## 🛠️ Технологический стек

### Бэкенд
- **FastAPI** — REST API + WebSocket
- **SQLAlchemy** (синхронный) + **SQLite** — хранение данных
- **Pydantic** — валидация
- **python-jose** (JWT) + **bcrypt** — авторизация
- **authlib** — Google OAuth
- **Groq SDK** — AI-подсказки
- **subprocess / exec** — изолированный запуск кода в судье

### Фронтенд
- **React 19** + **TypeScript** + **Vite**
- **Zustand** — управление состоянием
- **TanStack React Query** — запросы к API и кэширование
- **Monaco Editor** — редактор кода (движок VS Code)
- **Tailwind CSS** + **Framer Motion** — стили и анимации
- **lucide-react** — иконки

---

## 🏗️ Архитектура

**Слоистый модульный монолит.** Каждый домен — самодостаточный модуль из 4 файлов:

```
<module>/
├── models.py     # ORM-модели (SQLAlchemy)
├── schemas.py    # схемы запросов/ответов (Pydantic)
├── crud.py       # операции с БД и бизнес-логика
└── router.py     # эндпоинты FastAPI
```

Так устроены все ~40 модулей. Все роутеры регистрируются в `main.py`.

```
┌──────────── Браузер (React + React Query) ────────────┐
│                     Axios + JWT                        │
└───────────────────────┬────────────────────────────────┘
                        ▼
┌──────────────── FastAPI (router) ──────────────────────┐
│   Pydantic → crud → SQLAlchemy → SQLite                 │
│        │                                                │
│        ├──► BackgroundTask: судья (subprocess/exec)     │
│        ├──► WebSocket: чат и живые таблицы              │
│        └──► Groq AI: подсказки и разбор ошибок          │
└─────────────────────────────────────────────────────────┘
```

### Как работает судья
1. Решение приходит в `POST /submissions/` → сохраняется (статус `pending`)
2. Запускается фоновая задача `judge_submission`
3. Для каждого теста код выполняется через `subprocess` с лимитом времени
4. Вывод нормализуется и сравнивается с эталоном
5. Выносится вердикт: `accepted` / `wrong_answer` / `time_limit` / `runtime_error` / `compile_error`
6. Результат обновляет таблицу контеста, статус дуэли и прогресс тренировки

> На Windows при блокировке запуска Smart App Control (`WinError 4551`) судья автоматически переключается на исполнение Python-кода внутри процесса через `exec()`.

---

## 🚀 Запуск

### Требования
- Python 3.11+
- Node.js 18+
- (опционально) `g++` / `gcc` для C/C++ и `node` для JavaScript в судье

### 1. Бэкенд

```bash
# Виртуальное окружение
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # Windows
# source .venv/bin/activate       # Linux/Mac

# Зависимости
pip install -r requirements.txt

# Запуск
uvicorn main:app --reload
```

API и документация: **http://localhost:8000/docs**

### 2. Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Приложение: **http://localhost:5173**

---

## ⚙️ Переменные окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=sqlite:///./database.db
SECRET_KEY=your-secret-jwt-key
FRONTEND_URL=http://localhost:5173

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# AI-подсказки (опционально)
GROQ_API_KEY=...
```

---

## 🗄️ База данных

Схема создаётся автоматически при старте (`Base.metadata.create_all`). Дополнительно в `main.py` есть идемпотентные миграции для дозаливки новых колонок.

Полноценные миграции — через **Alembic** (папка `alebmic/`, спеллинг нестандартный):

```bash
alembic revision --autogenerate -m "описание"
alembic upgrade head
```

---

## 🔐 Авторизация

- **JWT access-токен** — срок жизни 60 минут
- **Refresh-токен** — 30 дней, хранится в БД, можно отозвать
- **Роли:** `user`, `moderator`, `admin`
- Защита эндпоинтов через зависимости `get_current_user` и `require_role([...])`
- Вход по email/паролю или через **Google OAuth**

---

## 📂 Структура проекта

```
aetheris/
├── main.py                  # точка входа, регистрация роутеров
├── database.py              # подключение к БД
├── websocket_manager.py     # менеджер WebSocket-соединений
├── auth/                    # авторизация (JWT, OAuth)
├── users/                   # пользователи и роли
├── problems/                # задачи
├── submissions/             # посылки + судья (judge.py)
├── contests/                # контесты + WebSocket
├── duels/                   # дуэли 1 на 1
├── teams/                   # команды
├── ratings/                 # рейтинг и лидерборд
├── ai_hints/ ai_analysis/   # AI-наставник
├── training_plans/          # тренировки
├── ... (ещё ~30 модулей)
└── frontend/                # React + TypeScript SPA
    └── src/
        ├── pages/           # страницы
        ├── components/      # компоненты
        ├── store/           # Zustand-сторы
        ├── api/             # клиент API
        └── i18n/            # переводы (20 языков)
```

---

## 🌐 Поддерживаемые языки решений

| Язык | Как запускается |
|---|---|
| Python 3 | интерпретатор (с in-process fallback) |
| C++ 17 | `g++ -O2 -std=c++17` |
| C | `gcc -O2 -std=c11` |
| JavaScript | `node` |

---

## 📜 Лицензия

Проект распространяется под лицензией **MIT**.

---

<div align="center">

Сделано с ⚡ для любителей спортивного программирования

</div>
