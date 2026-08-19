"""Pydantic schemas for the price-prediction service."""
from typing import Literal, Optional

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """10 features the model consumes — matching the original training schema."""

    posted_by: Literal["owner", "dealer", "builder"]
    under_construction: bool = False
    rera_approved: bool = False
    bhk_no: int = Field(ge=0, le=20)
    unit_type: Literal["bhk", "rk"]
    square_ft: float = Field(gt=0)
    ready_to_move: bool = True
    is_resale: bool = False
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class ConfidenceRange(BaseModel):
    low_lacs: float
    high_lacs: float


class PredictResponse(BaseModel):
    """Model output. Price is in INR Lacs (TARGET(PRICE_IN_LACS))."""

    predicted_price_lacs: float
    confidence_range: Optional[ConfidenceRange] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    feature_names: list[str]
    n_estimators: Optional[int] = None
    max_depth: Optional[int] = None
    learning_rate: Optional[float] = None
    detail: Optional[str] = None
