from fastapi import APIRouter, Depends, Query
from app.schemas.ticket import SearchResponse, SearchParams, TicketDetail
from app.services.zendesk import zendesk_service

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
def search_tickets(
    q: str = Query(..., description="Keyword to search"),
    search_content: bool = Query(False, description="If true, search in content, else subject only"),
    status: str = Query(None, description="Filter by status (open, pending, solved, closed)"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)")
):
    params = SearchParams(
        q=q,
        search_content=search_content,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return zendesk_service.search_tickets(params)

@router.get("/tickets/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: int):
    return zendesk_service.get_ticket_detail(ticket_id)
