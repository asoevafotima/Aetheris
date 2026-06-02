from sqlalchemy.orm import Session, joinedload
from .models import Problem
from .schemas import ProblemCreate, ProblemUpdate
from slugify import slugify
import uuid

def get_problem_by_id(db: Session, problem_id: uuid.UUID):
    return (
        db.query(Problem)
        .options(joinedload(Problem.tag_map))
        .filter(Problem.id == problem_id)
        .first()
    )

def get_problem_by_slug(db: Session, slug: str):
    return (
        db.query(Problem)
        .options(joinedload(Problem.tag_map))
        .filter(Problem.slug == slug)
        .first()
    )

def _difficulty_code_sort_key(code: str | None) -> tuple:
    if not code:
        return (999, 0)
    letter = code[0].upper()
    suffix = int(code[1:]) if len(code) > 1 and code[1:].isdigit() else 0
    return (ord(letter) - ord('A'), suffix)

def get_all_problems(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    difficulty: str = None,
    difficulty_code: str = None,
    topic: str = None,
):
    from problem_tag_map.models import ProblemTagMap
    from problem_tags.models import ProblemTag

    query = (
        db.query(Problem)
        .options(joinedload(Problem.tag_map))
        .filter(Problem.is_public == True)
    )
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    if difficulty_code:
        query = query.filter(Problem.difficulty_code == difficulty_code)
    if topic:
        query = (
            query
            .join(ProblemTagMap, ProblemTagMap.problem_id == Problem.id)
            .join(ProblemTag, ProblemTag.id == ProblemTagMap.tag_id)
            .filter(ProblemTag.slug == topic)
        )

    problems = query.offset(skip).limit(limit).all()
    problems.sort(key=lambda p: _difficulty_code_sort_key(p.difficulty_code))
    return problems

def create_problem(db: Session, data: ProblemCreate, author_id: uuid.UUID):
    slug = slugify(data.title)
    db_problem = Problem(
        **data.model_dump(),
        slug=slug,
        author_id=author_id
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def update_problem(db: Session, problem_id: uuid.UUID, data: ProblemUpdate):
    db_problem = get_problem_by_id(db, problem_id)
    if not db_problem:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_problem, field, value)
    db.commit()
    db.refresh(db_problem)
    return db_problem

def delete_problem(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db.delete(db_problem)
        db.commit()
    return db_problem

def increment_solve_count(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db_problem.solve_count += 1
        db.commit()

def increment_attempt_count(db: Session, problem_id: uuid.UUID):
    db_problem = get_problem_by_id(db, problem_id)
    if db_problem:
        db_problem.attempt_count += 1
        db.commit()
