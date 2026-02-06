import os
import sys
import requests
import argparse
import csv
import time
from datetime import datetime
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# =========================
# CONFIGURAZIONE ZENDESK
# =========================
SUBDOMAIN = os.getenv("ZENDESK_SUBDOMAIN")
EMAIL = os.getenv("ZENDESK_EMAIL")
API_TOKEN = os.getenv("ZENDESK_API_TOKEN")

if not all([SUBDOMAIN, EMAIL, API_TOKEN]):
    print("Errore: Credenziali Zendesk mancanti nel file .env o nelle variabili d'ambiente.")
    sys.exit(1)

BASE_URL = f"https://{SUBDOMAIN}.zendesk.com/api/v2"

def search_all_tickets(keyword):
    """
    Cerca TUTTI i ticket in Zendesk che contengono la keyword specificata (paginazione).
    Restituisce un generatore di ticket.
    """
    session = requests.Session()
    session.auth = (f"{EMAIL}/token", API_TOKEN)
    session.headers.update({"Content-Type": "application/json"})

    # Costruisci la query di ricerca
    query = f"type:ticket \"{keyword}\""
    
    url = f"{BASE_URL}/search.json"
    params = {
        "query": query,
        "sort_by": "created_at",
        "sort_order": "desc"
    }

    print(f"Inizio ricerca per: '{keyword}'...")
    
    while url:
        try:
            response = session.get(url, params=params)
            
            # Reset params after first call because next_page url usually contains them
            # but Zendesk API behavior varies. Usually next_page is a full URL.
            # If next_page is used, params should be empty or already included in URL.
            params = None 

            response.raise_for_status()
            data = response.json()
            
            results = data.get("results", [])
            for ticket in results:
                yield ticket
            
            # Paginazione
            url = data.get("next_page")
            
            # Se siamo alla fine o next_page è uguale (evita loop infinito se API buggata)
            if not results and not url:
                break
                
        except requests.exceptions.RequestException as e:
            print(f"Errore durante la ricerca: {e}")
            break

def save_to_csv(tickets, keyword):
    """Salva i ticket in un file CSV."""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_keyword = "".join(c for c in keyword if c.isalnum() or c in (' ', '_', '-')).strip().replace(" ", "_")
    filename = f"tickets_{safe_keyword}_{timestamp}.csv"
    
    # Campi da esportare
    fields = ["id", "created_at", "status", "subject", "url"]
    
    count = 0
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        
        for t in tickets:
            # Aggiusta il link per essere cliccabile dall'agente se necessario, 
            # ma qui usiamo l'url API o costruiamo quello agente?
            # Preferiamo costruire il link agente per comodità
            tid = t.get("id")
            t["url"] = f"https://{SUBDOMAIN}.zendesk.com/agent/tickets/{tid}"
            
            writer.writerow(t)
            count += 1
            # Simple progress indicator
            if count % 20 == 0:
                print(f"Scaricati {count} ticket...", end="\r")

    print(f"\nSalvataggio completato: {count} ticket scritti in '{filename}'.")

def main():
    parser = argparse.ArgumentParser(description="Cerca ticket in Zendesk e esporta in CSV.")
    parser.add_argument("keyword", nargs="?", help="La parola chiave da cercare")
    args = parser.parse_args()

    keyword = args.keyword
    
    if not keyword:
        try:
            keyword = input("Inserisci la parola chiave per la ricerca: ").strip()
        except KeyboardInterrupt:
            print("\nOperazione annullata.")
            sys.exit(0)

    if not keyword:
        print("Nessuna parola chiave inserita. Esco.")
        sys.exit(1)

    # Esegue ricerca e salva
    tickets_iter = search_all_tickets(keyword)
    save_to_csv(tickets_iter, keyword)

if __name__ == "__main__":
    main()
