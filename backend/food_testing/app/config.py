import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    """
    Application settings loaded from environment variables
    """
    PROJECT_NAME: str = "food_testing"
    ENV: str = os.getenv("ENV", "dev")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    
# Create a global settings instance
settings = Settings()
