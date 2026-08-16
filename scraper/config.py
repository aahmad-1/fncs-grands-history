BASE_URL = "https://liquipedia.net/fortnite/api.php"

USER_AGENT = "FNCSResearch/1.0 (https://github.com/aahmad-1/fncs-grands-history)"

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Encoding": "gzip"
}

SLEEP_SECONDS = 30

OUTPUT_DIR = "data/cleaned"

NON_NA_REGIONS = [
           "Europe", 
           "Brazil", 
           "Asia", 
           "Oceania", 
           "Middle_East"]

# maps the region abbreviation to how it appears in the liquipedia URL
# note, if a brand new NA region name/abbreviation appears (not just a split change), REMEMBER to add it here too
# and update get_valid_na_regions() in parser.py to match
REGION_URL_PARTS = {
    "NAC": ["North_America_Central", "North_America"],
    "NAE": ["North_America_East", "NAE"],
    "NAW": ["North_America_West", "NAW"],
    "EU": ["Europe"],
    "BR": ["Brazil"],
    "AS": ["Asia"],
    "OCE": ["Oceania"],
    "ME": ["Middle_East"]
}

# base FNCS Grand Finals urls as of 16/8/26. Will add more url's as more FNCS's finnish.
LIQUIPEDIA_URLS = [
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Season_X/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_1/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_2/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Invitational/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_3/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_4/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_5/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_6/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/All-Star_Showdown/Solo/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_7/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_8/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2021/Grand_Royale",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_3/Season_1/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_3/Season_2/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_3/Season_3/Grand_Finals",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2022/Invitational",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023/Major_1",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023/Major_2",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023/Major_3",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2024/Major_1",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2024/Major_2",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2024/Major_3",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2024",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025/Major_1",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025/Major_2",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025/Major_3",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2025",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2026/Major_1",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2026/Major_1/Summit",
    "https://liquipedia.net/fortnite/Fortnite_Champion_Series/2026/Major_2",
]