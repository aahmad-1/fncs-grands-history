BASE_URL = "https://liquipedia.net/fortnite/api.php"

USER_AGENT = "FNCSResearch/1.0 (ahmad.paturusi@student.lut.fi)"

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Encoding": "gzip"
}

SLEEP_SECONDS = 30

OUTPUT_DIR = "data/cleaned"

# regions to scrape - remove/add regions as needed
REGIONS = [
            "North_America_East", 
           "North_America_West", 
           "North_America_Central", 
           "North_America", 
           "Europe", 
           "Brazil", 
           "Asia", 
           "Oceania", 
           "Middle_East"]

# maps the region abbreviation to how it appears in the liquipedia URL
REGION_URL_PARTS = {
    "NAC": "North_America_Central/North_America",
    "NAE": "North_America_East",
    "NAW": "North_America_West",
    "EU": "Europe",
    "BR": "Brazil",
    "AS": "Asia",
    "OCE": "Oceania",
    "ME": "Middle_East"
}

# base FNCS Grand Finals urls - add/remove urls to control what gets scraped
LIQUIPEDIA_URLS = [
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025/Major_2",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025/Major_3",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2024"
]