import requests
import urllib.parse
from fastapi import HTTPException
from app.core.config import settings
from app.schemas.ticket import TicketBase, TicketDetail, SearchResponse, SearchParams

class ZendeskService:
    def __init__(self):
        self.base_url = f"https://{settings.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2"
        self.auth = (f"{settings.ZENDESK_EMAIL}/token", settings.ZENDESK_API_TOKEN)
        self.headers = {"Content-Type": "application/json"}

    def _get_agent_url(self, ticket_id: int) -> str:
        return f"https://{settings.ZENDESK_SUBDOMAIN}.zendesk.com/agent/tickets/{ticket_id}"

    def build_query(self, params: SearchParams) -> str:
        # Base query for tickets
        parts = ["type:ticket"]
        
        # Keyword search
        if params.q:
            if params.search_content:
                # Search everywhere (default zendesk behavior for string)
                parts.append(f"\"{params.q}\"")
            else:
                # Search specifically in subject
                parts.append(f"subject:\"{params.q}\"")
        
        # Status filter
        if params.status:
             parts.append(f"status:{params.status}")

        return " ".join(parts)

    def search_tickets(self, params: SearchParams) -> SearchResponse:
        query = self.build_query(params)
        endpoint = f"{self.base_url}/search.json"
        
        api_params = {
            "query": query,
            "sort_by": params.sort_by,
            "sort_order": params.sort_order
        }

        try:
            response = requests.get(endpoint, auth=self.auth, headers=self.headers, params=api_params)
            response.raise_for_status()
            data = response.json()
            
            tickets = []
            for item in data.get("results", []):
                tickets.append(TicketBase(
                    id=item.get("id"),
                    subject=item.get("subject"),
                    description=item.get("description"), # Might be truncated in search results
                    status=item.get("status"),
                    created_at=item.get("created_at"),
                    updated_at=item.get("updated_at"),
                    url=self._get_agent_url(item.get("id"))
                ))
            
            return SearchResponse(
                results=tickets,
                count=data.get("count", 0),
                next_page=data.get("next_page"),
                previous_page=data.get("previous_page")
            )
            
        except requests.RequestException as e:
            # Log error strictly here
            print(f"Zendesk API Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch tickets from Zendesk")

    def get_ticket_detail(self, ticket_id: int) -> TicketDetail:
        endpoint = f"{self.base_url}/tickets/{ticket_id}.json"
        
        try:
            response = requests.get(endpoint, auth=self.auth, headers=self.headers)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Ticket not found")
            response.raise_for_status()
            
            data = response.json().get("ticket", {})
            return TicketDetail(
                id=data.get("id"),
                subject=data.get("subject"),
                description=data.get("description"),
                status=data.get("status"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
                url=self._get_agent_url(data.get("id")),
                tags=data.get("tags", []),
                priority=data.get("priority"),
                type=data.get("type")
            )
        except requests.RequestException as e:
             print(f"Zendesk API Error: {e}")
             raise HTTPException(status_code=500, detail="Failed to fetch ticket details")

zendesk_service = ZendeskService()
