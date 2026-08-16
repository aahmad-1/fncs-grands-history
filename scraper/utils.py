import os
import csv
from config import OUTPUT_DIR, REGION_URL_PARTS


def csv_exists(folder_name, csv_filename):
    filepath = os.path.join(OUTPUT_DIR, folder_name, csv_filename)
    return os.path.exists(filepath)


def build_csv_filename(folder_name, region):
    if folder_name.startswith("Globals"):
        return f"{folder_name}.csv"
    for abbreviation, url_part in REGION_URL_PARTS.items():
        if region in url_part:
            return f"{folder_name}_{abbreviation}.csv"
    raise ValueError(f"No matching region abbreviation for: {region}")

def save_to_csv(placements, metadata, folder_name, csv_filename):
    folder_path = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    filepath = os.path.join(folder_path, csv_filename)

    headers = [
        "Placement", "Player(s)", "Earnings", "Liquipedia ID's",
        "Region", "Gamemode", "Max Teams", "Total Teams",
        "Start Date", "End Date", "URL"
    ]

    with open(filepath, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(headers)

        for i, row in enumerate(placements):
            if i == 0:
                writer.writerow([
                    row["placement"], row["players"], row["earnings"], row["liquipedia_ids"],
                    metadata["region"], metadata["gamemode"], metadata["max_teams"], metadata["total_teams"],
                    metadata["start_date"], metadata["end_date"], metadata["url"]
                ])
            else:
                writer.writerow([
                    row["placement"], row["players"], row["earnings"], row["liquipedia_ids"],
                    "", "", "", "", "", "", ""
                ])

    print(f"Saved {filepath}\n")


if __name__ == "__main__":
    assert build_csv_filename("Globals_2023", "Global") == "Globals_2023.csv"
    assert build_csv_filename("Season_X", "NAE") == "Season_X_NAE.csv"
    print("Good")