FROM python:3.12-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim

# Install system deps for Docker socket access
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r linuxlab && useradd -r -g linuxlab -m linuxlab

WORKDIR /app

# Copy installed packages
COPY --from=builder /install /usr/local

# Copy application
COPY . .

# Create data directory
RUN mkdir -p /app/data && chown -R linuxlab:linuxlab /app

# Note: We run as root to access Docker socket
# The app itself validates and constrains all Docker operations
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
