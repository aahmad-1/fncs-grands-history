import os
import csv
import psycopg2
from dotenv import load_dotenv

load_dotenv()

CLEANED_DIR = "data/cleaned"


def connect_db():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def get_all_csv_paths():
    csv_paths = []
    for folder_name in os.listdir(CLEANED_DIR):
        folder_path = os.path.join(CLEANED_DIR, folder_name)
        for filename in os.listdir(folder_path):
            if filename.endswith(".csv"):
                csv_paths.append(os.path.join(folder_path, filename))
    return csv_paths


def insert_tournament(cur, event_name, row):
    cur.execute("""
        INSERT INTO tournaments (name, gamemode, region, max_teams, total_teams, prize_pool, play_setting, location, venue, start_date, end_date, url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (name, region) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    """, (
        event_name, row["Gamemode"], row["Region"], row["Max Teams"], row["Total Teams"],
        row["Prize Pool"], row["Play Setting"], row["Location"], row["Venue"],
        row["Start Date"], row["End Date"], row["URL"]
    ))
    return cur.fetchone()[0]


def insert_player(cur, liquipedia_id, display_name):
    cur.execute("""
        INSERT INTO players (liquipedia_id, display_name)
        VALUES (%s, %s)
        ON CONFLICT (liquipedia_id) DO UPDATE SET display_name = EXCLUDED.display_name
    """, (liquipedia_id, display_name))
    cur.execute("""
        INSERT INTO player_aliases (player_id, display_name)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
    """, (liquipedia_id, display_name))


def insert_placement(cur, tournament_id, placement, earnings, names, ids):
    cur.execute("""
        INSERT INTO placements (tournament_id, placement, earnings)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (tournament_id, placement, earnings))
    placement_id = cur.fetchone()[0]

    for name, liquipedia_id in zip(names, ids):
        insert_player(cur, liquipedia_id, name)
        cur.execute("""
            INSERT INTO placement_players (placement_id, player_id)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
        """, (placement_id, liquipedia_id))


def load_csv(cur, csv_path):
    event_name = os.path.basename(os.path.dirname(csv_path))

    with open(csv_path, newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        rows = list(reader)

    tournament_id = insert_tournament(cur, event_name, rows[0])

    for row in rows:
        names = row["Player(s)"].split(";")
        ids = row["Liquipedia ID's"].split(";")
        insert_placement(cur, tournament_id, row["Placement"], row["Earnings"], names, ids)

    print(f"Loaded {csv_path}")


def run():
    conn = connect_db()
    cur = conn.cursor()

    for csv_path in get_all_csv_paths():
        load_csv(cur, csv_path)

    conn.commit()
    cur.close()
    conn.close()
    print("All CSVs loaded.")

if __name__ == "__main__":
    run()