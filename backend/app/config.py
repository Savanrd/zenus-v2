import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "Network Investigator"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DATA_DIR / 'network_investigator.db'}")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # AI Engine Settings
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic") # "deterministic", "openai", "gemini", "groq"
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-2.5-flash")
    
    # Correlation Engine Thresholds
    TEMPORAL_WINDOW_SECONDS: int = int(os.getenv("TEMPORAL_WINDOW_SECONDS", "300")) # 5 minutes
    CORRELATION_CONFIDENCE_THRESHOLD: float = float(os.getenv("CORRELATION_CONFIDENCE_THRESHOLD", "0.65"))
    AUTO_INCIDENT_MIN_EVENTS: int = int(os.getenv("AUTO_INCIDENT_MIN_EVENTS", "3"))
    
    # Real-time Simulation Settings
    SIMULATION_TICK_INTERVAL_MS: int = int(os.getenv("SIMULATION_TICK_INTERVAL_MS", "2500"))

settings = Settings()
