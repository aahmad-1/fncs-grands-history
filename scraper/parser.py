import re
from bs4 import BeautifulSoup
from config import REGION_URL_PARTS

URL_PATTERNS = [
    (r'Season_X', lambda m: 'Season X'),
    (r'Chapter_(\d+)/Season_(\d+)', lambda m: f'C{m[1]}S{m[2]}'),
    (r'Invitational/Grand_Finals$', lambda m: 'C2S2 Invitationals'),
    (r'Grand_Royale$', lambda m: 'Grand Royale'),
    (r'All-Star_Showdown', lambda m: 'All Star Showdown'),
    (r'(\d{4})/Major_(\d+)/Summit', lambda m: f'Globals C{int(m[1])-2019}M{m[2]} Summit'),
    (r'(\d{4})(?!/Major_|/Grand_)', lambda m: f'Globals {m[1]}'),
    (r'(\d{4})/Major_(\d+)', lambda m: f'C{int(m[1])-2019}M{m[2]}'),
    # will add more if liquipedia future FNCS grand lb URL's have a new pattern
]


def create_folder_name(url):
    for pattern, event_name in URL_PATTERNS:
        m = re.search(pattern, url)
        if m:
            folder_name = event_name(m)
            return folder_name.replace(" ", "_")
    raise ValueError(f"No matching pattern for: {url}")


# NOTE: NA region splits have changed multiple times (NAE/NAW -> merged NAC -> NAC/NAW).
# if Epic changes NA region structure again, will add a new elif tier here with the
# chapter/major it started, following the same (chapter, major) <= pattern.
def get_valid_na_regions(url):
    if "All-Star" in url: # all star doesn't use North_American_East/West for some reason
        return ["NAE", "NAW"]
    
    m = re.search(r'(\d{4})/Major_(\d+)', url)
    if m:
        chapter, major = int(m[1]) - 2019, int(m[2])
    else:
        m = re.search(r'Chapter_(\d+)/Season_(\d+)', url)
        chapter, major = (int(m[1]), int(m[2])) if m else (0, 0)

    if (chapter, major) <= (4, 1):
        return ["North_America_East", "North_America_West"]
    elif (chapter, major) <= (5, 3):
        return ["North_America"]
    else:
        return ["North_America_Central", "North_America_West"]


def get_liquipedia_id(player_tag):
    name = player_tag.get_text()
    href = player_tag.get("href")
    if "redlink=1" in href:
        title = href.split("title=")[1].split("&action=")[0]
        return f"/fortnite/{title}"
    return href


def get_region_from_url(url):
    region = url.split("/")[-1]
    for abbreviation, url_part in REGION_URL_PARTS.items():
        if region in url_part or any(region in part for part in url_part) if isinstance(url_part, list) else region in url_part: # oh my god
            return abbreviation
    return "Global"

def detect_gamemode(players_wrapper):
    team_size = len(players_wrapper.find_all("div", recursive=False))
    if team_size == 1:
        return "Solos", 100
    elif team_size == 2:
        return "Duos", 50
    elif team_size == 3:
        return "Trios", 33
    else:
        return "Squads", 25

def extract_placements(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", class_="table2__table prizepooltable prizepooltable-placement")
    table_body = table.find("tbody")
    team1 = table_body.find("td", class_="prizepooltable-col-team")
    players_wrapper = team1.find("div")
    max = 0
    
    gamemode, max = detect_gamemode(players_wrapper)

    rows = []
    placement = 0
    for table_entry in table_body.find_all("tr", class_="table2__row--body"):

        if placement == max:
            return rows
        
        player_names = []
        liquipedia_ids = []
        players_wrapper = table_entry.find("div", class_="block-players-wrapper")

        for player in players_wrapper.find_all("span", class_="name"):
            player_tag = player.find("a")
            player_names.append(player_tag.get_text())
            liquipedia_ids.append(get_liquipedia_id(player_tag))

        earnings_cell = table_entry.find_all("td")[2].get_text()
        earnings = "0" if earnings_cell == "-" else earnings_cell[1:].replace(",", "")

        placement += 1
        rows.append({
            "placement": placement,
            "players": ";".join(player_names),
            "earnings": earnings,
            "liquipedia_ids": ";".join(liquipedia_ids)
        })

    return rows


def extract_metadata(html_text, url):
    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", class_="table2__table prizepooltable prizepooltable-placement")
    table_body = table.find("tbody")
    team1 = table_body.find("td", class_="prizepooltable-col-team")
    players_wrapper = team1.find("div")
    
    gamemode, max_teams = detect_gamemode(players_wrapper)

    total_teams = 0
    for table_entry in table_body.find_all("tr", class_="table2__row--body"):
        total_teams += 1


    right_box = soup.find("div", class_="fo-nttax-infobox")
    
    for row in right_box.find_all("div", recursive=False):
        if row.div.get_text() == "Start Date:":
            start_date = row.find_all("div")[1].get_text()
            end_date = row.find_next_sibling("div").find_all("div")[1].get_text()
        elif row.div.get_text() == "Date:":
            start_date = end_date = row.find_all("div")[1].get_text()
        else:
            continue


    return {
        "region": get_region_from_url(url),
        "gamemode": gamemode,
        "max_teams": max_teams,
        "total_teams": total_teams,
        "start_date": start_date,
        "end_date": end_date,
        "url": url
    }


if __name__ == "__main__":
    assert create_folder_name("https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023/Major_2") == "C4M2"
    assert create_folder_name("https://liquipedia.net/fortnite/Fortnite_Champion_Series/Chapter_2/Season_1/Grand_Finals") == "C2S1"
    assert create_folder_name("https://liquipedia.net/fortnite/Fortnite_Champion_Series/2023") == "Globals_2023"
    print("All parser tests passed.")