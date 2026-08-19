"""Model loading + prediction logic.

Wraps the House-Prediction-Platform GradientBoostingRegressor (10 features,
target = TARGET(PRICE_IN_LACS)).
"""
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd
from sklearn.base import BaseEstimator

from schemas import PredictRequest, PredictResponse

logger = logging.getLogger("predictor")

MODEL_PATH = os.environ.get("MODEL_PATH", "model/house_price_model.pkl")

# Label encodings — confirmed from the training notebook and Flask app:
#   POSTED_BY: {Owner: 1, Dealer: 2, Builder: 3}
#   BHK_OR_RK: {BHK: 1, RK: 0}
POSTED_BY_ENCODING: Dict[str, int] = {"owner": 1, "dealer": 2, "builder": 3}
BHK_OR_RK_ENCODING: Dict[str, int] = {"bhk": 1, "rk": 0}

# Heuristic ±15% confidence band for the "Great deal / Overpriced" badges.
# The model has no native confidence interval.
CONFIDENCE_BAND_PCT = 0.15

_model: Optional[BaseEstimator] = None
_model_meta: Dict[str, Any] = {}


def load_model() -> BaseEstimator:
    """Loads the pickled model once at startup."""
    global _model
    if _model is not None:
        return _model

    path = Path(MODEL_PATH)
    if not path.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {path}. "
            "Copy house_price_model.pkl from the House-Prediction-Platform repo."
        )

    model = joblib.load(path)

    if not hasattr(model, "feature_names_in_"):
        raise RuntimeError(
            "Loaded model has no feature_names_in_ — not a fitted sklearn estimator"
        )

    features = list(model.feature_names_in_)
    logger.info("model loaded: %d features -> %s", len(features), features)

    _model = model
    _model_meta["feature_names"] = features
    params = getattr(model, "get_params", lambda: {})()
    _model_meta["n_estimators"] = params.get("n_estimators")
    _model_meta["max_depth"] = params.get("max_depth")
    _model_meta["learning_rate"] = params.get("learning_rate")
    return model


def predict(req: PredictRequest) -> PredictResponse:
    model = load_model()

    row = {
        "POSTED_BY": POSTED_BY_ENCODING[req.posted_by],
        "UNDER_CONSTRUCTION": int(req.under_construction),
        "RERA": int(req.rera_approved),
        "BHK_NO.": req.bhk_no,
        "BHK_OR_RK": BHK_OR_RK_ENCODING[req.unit_type],
        "SQUARE_FT": float(req.square_ft),
        "READY_TO_MOVE": int(req.ready_to_move),
        "RESALE": int(req.is_resale),
        "LONGITUDE": req.longitude,
        "LATITUDE": req.latitude,
    }

    features = _model_meta["feature_names"]
    df = pd.DataFrame([row]).reindex(columns=features)
    predicted_lacs = float(model.predict(df)[0])
    # Clamp negative predictions to 0
    predicted_lacs = max(0.0, predicted_lacs)

    return PredictResponse(
        predicted_price_lacs=round(predicted_lacs, 2),
        confidence_range={
            "low_lacs": round(predicted_lacs * (1 - CONFIDENCE_BAND_PCT), 2),
            "high_lacs": round(predicted_lacs * (1 + CONFIDENCE_BAND_PCT), 2),
        },
    )


def model_metadata() -> Dict[str, Any]:
    load_model()
    return {
        "feature_names": _model_meta["feature_names"],
        "n_estimators": _model_meta.get("n_estimators"),
        "max_depth": _model_meta.get("max_depth"),
        "learning_rate": _model_meta.get("learning_rate"),
    }
