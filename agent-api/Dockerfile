FROM python:3.12
WORKDIR /usr/local/app

COPY . .
RUN pip install -r requirements.txt
ENV GROQ_API_KEY=
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "5000"]