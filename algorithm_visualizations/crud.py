from sqlalchemy.orm import Session
from .models import AlgorithmVisualization
from .schemas import AlgorithmVisualizationCreate, AlgorithmVisualizationUpdate
import uuid

def create_visualization(db: Session, data: AlgorithmVisualizationCreate, author_id: uuid.UUID):
    db_vis = AlgorithmVisualization(**data.model_dump(), author_id=author_id)
    db.add(db_vis)
    db.commit()
    db.refresh(db_vis)
    return db_vis

def get_visualization_by_id(db: Session, vis_id: uuid.UUID):
    return db.query(AlgorithmVisualization).filter(
        AlgorithmVisualization.id == vis_id
    ).first()

def get_all_visualizations(db: Session, skip: int = 0, limit: int = 20):
    return db.query(AlgorithmVisualization).filter(
        AlgorithmVisualization.is_public == True
    ).offset(skip).limit(limit).all()

def get_visualizations_by_problem(db: Session, problem_id: uuid.UUID):
    return db.query(AlgorithmVisualization).filter(
        AlgorithmVisualization.problem_id == problem_id
    ).all()

def update_visualization(db: Session, vis_id: uuid.UUID, data: AlgorithmVisualizationUpdate):
    db_vis = get_visualization_by_id(db, vis_id)
    if not db_vis:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(db_vis, field, value)
    db.commit()
    db.refresh(db_vis)
    return db_vis

def delete_visualization(db: Session, vis_id: uuid.UUID):
    db_vis = get_visualization_by_id(db, vis_id)
    if db_vis:
        db.delete(db_vis)
        db.commit()
    return db_vis