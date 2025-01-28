import modal 
from main import app as web_app

# Create a Modal App
app = modal.App("chat-web-app")

# Define the Python environment and dependencies
image = modal.Image.debian_slim().pip_install(
    "fastapi[standard]",
    "pydantic",
    "supabase",
    "uvicorn",
    "sqlalchemy",
    "psycopg2-binary",
    "python-dotenv",
    "openai",
)

@app.function(image=image, secrets=[modal.Secret.from_name("fastapi-secrets")])
@modal.asgi_app()
def fastapi_app():
    return web_app
