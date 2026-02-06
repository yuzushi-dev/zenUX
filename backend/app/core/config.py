from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZenUX"
    API_V1_STR: str = "/api/v1"
    
    # Zendesk Config
    ZENDESK_SUBDOMAIN: str
    ZENDESK_EMAIL: str
    ZENDESK_API_TOKEN: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
