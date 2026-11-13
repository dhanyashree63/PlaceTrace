import os
from fastapi import Header, HTTPException, status

EXPECTED_API_KEY = os.environ.get("ML_API_KEY", "internal-ml-service-token-change-in-production")


def verify_internal_api_key(x_ml_api_key: str = Header(default="")):
    if x_ml_api_key and x_ml_api_key != EXPECTED_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal ML API key.",
        )
    return True
