import requests
import time
from scraper.config import BASE_URL, HEADERS, SLEEP_SECONDS


def fetch_page(page_param):
    params = {
        "action": "parse",
        "page": page_param,
        "format": "json",
        "maxlag": "5"
    }

    session = requests.Session()
    response = session.get(BASE_URL, params=params, headers=HEADERS)

    time.sleep(SLEEP_SECONDS)

    if response.status_code != 200:
        print(f"Failed to fetch {page_param}: status {response.status_code}")
        return None

    data = response.json()
    if "error" in data:
        print(f"API error for {page_param}: {data['error']}\n")
        return None

    return data["parse"]["text"]["*"]