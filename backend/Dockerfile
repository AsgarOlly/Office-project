# ThreadCraft Luxe Flask REST API Dockerfile
FROM python:3.11-slim

WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code into /workspace/backend so 'backend.app' imports work seamlessly
COPY . ./backend
WORKDIR /workspace/backend

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=5001 \
    PYTHONPATH=/workspace

EXPOSE 5001

CMD ["python", "run.py"]
