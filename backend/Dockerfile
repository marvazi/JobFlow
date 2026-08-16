FROM python:3.13-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sqlalchemy \
    psycopg2-binary \
    pydantic \
    email-validator \
    "passlib[bcrypt]" \
    "python-jose[cryptography]" \
    bcrypt==4.0.1 \
    python-multipart \
    alembic

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]