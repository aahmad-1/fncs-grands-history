import re
from bs4 import BeautifulSoup
from config import REGION_URL_PARTS

URL_PATTERNS = [
    (r'Season_X', lambda m: 'Season X'),
    (r'Chapter_(\d+)/Season_(\d+)', lambda m: f'C{m[1]}S{m[2]}'),
    (r'Invitational/Grand_Finals$', lambda m: 'C2S2 Invitationals'),
    (r'Grand_Royale$', lambda m: 'Grand Royale'),
    (r'All-Star_Showdown', lambda m: 'Solo All Star'),
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


def get_liquipedia_id(player_tag):
    name = player_tag.get_text()
    href = player_tag.get("href")
    if "redlink=1" in href:
        return f"/fortnite/{name.replace(' ', '_')}"
    return href


def get_region_from_url(url):
    region = url.split("/")[-1]
    for abbreviation, url_part in REGION_URL_PARTS.items():
        if region in url_part:
            return abbreviation
    return "Global"

def extract_placements(html_text):
    soup = BeautifulSoup(html_text, "html.parser")
    table = soup.find("table", class_="table2__table prizepooltable prizepooltable-placement")
    table_body = table.find("tbody")
    team1 = table_body.find("td", class_="prizepooltable-col-team")
    players_wrapper = team1.find("div")
    max = 0
    
    if len(players_wrapper) == 1:
        max = 100
    elif len(players_wrapper) == 2:
        max = 50
    elif len(players_wrapper) == 3:
        max = 33
    else:
        max = 25

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
    
    if len(players_wrapper) == 1:
        max_teams = 100
        gamemode = "Solos"
    elif len(players_wrapper) == 2:
        max_teams = 50
        gamemode = "Duos"
    elif len(players_wrapper) == 3:
        max_teams = 33
        gamemode = "Trios"
    else:
        max_teams = 25
        gamemode = "Squads"

    total_teams = 0
    for table_entry in table_body.find_all("tr", class_="table2__row--body"):
        total_teams += 1


    right_box = soup.find("div", class_="fo-nttax-infobox")
    
    for row in right_box.find_all("div", recursive=False):
        if row.div.get_text() == "Start Date:":
            start_date = row.find_all("div")[1].get_text()
            end_date = row.next_sibling("div")[1].get_text()
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