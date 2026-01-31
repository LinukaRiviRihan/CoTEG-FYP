# 1. Use Python 3.12
FROM python:3.12-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Set work directory
WORKDIR /code

# 4. Install system dependencies
# ADDED: git-lfs is required to download your heavy models from GitHub
RUN apt-get update && apt-get install -y \
    git \
    git-lfs \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && git lfs install

# 5. Install Python dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy the backend project code (This will ignore dl_models because of .gitignore)
COPY . /code/

# 7. [NEW] Download Models from your GitHub
# This clones your repo, pulls the heavy LFS files, moves them to the right place, and cleans up.
RUN git clone https://github.com/LinukaRiviRihan/CoTEG-FYP.git /tmp/repo && \
    cd /tmp/repo && \
    git lfs pull && \
    mkdir -p /code/dl_models && \
    mv /tmp/repo/backend/dl_models/* /code/dl_models/ && \
    rm -rf /tmp/repo

# 8. Create DB directory and set permissions
RUN mkdir -p /code/db && chmod -R 777 /code/db
RUN chmod -R 777 /code

# 9. Collect static files
RUN python manage.py collectstatic --noinput

# 10. Expose Port
EXPOSE 7860

# 11. Start Server
CMD ["gunicorn", "-b", "0.0.0.0:7860", "config.wsgi:application", "--timeout", "120"]