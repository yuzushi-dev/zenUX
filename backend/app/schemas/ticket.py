from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TicketBase(BaseModel):
    id: int
    subject: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    url: str # Agent URL

class TicketDetail(TicketBase):
    tags: List[str] = []
    priority: Optional[str] = None
    type: Optional[str] = None

class SearchResponse(BaseModel):
    results: List[TicketBase]
    count: int
    next_page: Optional[str] = None
    previous_page: Optional[str] = None

class SearchParams(BaseModel):
    q: str
    search_content: bool = False
    status: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
