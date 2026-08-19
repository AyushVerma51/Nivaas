"""Price-prediction microservice — FastAPI wrapper around the
House-Prediction-Platform house_price_model.pkl (10 features).
"""
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import predictor
from schemas import HealthResponse, PredictRequest, PredictResponse

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Price Prediction Service",
    description="Wraps house_price_model.pkl — 10 features predicting fair price in INR Lacs.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        meta = predictor.model_metadata()
        return HealthResponse(
            status="ok",
            model_loaded=True,
            feature_names=meta["feature_names"],
            n_estimators=meta.get("n_estimators"),
            max_depth=meta.get("max_depth"),
            learning_rate=meta.get("learning_rate"),
        )
    except Exception as exc:
        return HealthResponse(
            status="error",
            model_loaded=False,
            feature_names=[],
            detail=str(exc),
        )


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    try:
        return predictor.predict(req)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
