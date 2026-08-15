from config import LIQUIPEDIA_URLS, NON_NA_REGIONS
from scraper import fetch_page
from parser import create_folder_name, get_valid_na_regions, extract_placements, extract_metadata
from utils import csv_exists, build_csv_filename, save_to_csv


def run():
    for base_url in LIQUIPEDIA_URLS:
        page_param = base_url.replace("https://liquipedia.net/fortnite/", "")
        folder_name = create_folder_name(base_url)

        is_global = folder_name.startswith("Globals")
        regions_to_scrape = ["Global"] if is_global else get_valid_na_regions(base_url) + NON_NA_REGIONS

        for region in regions_to_scrape:
            csv_filename = build_csv_filename(folder_name, region)

            if csv_exists(folder_name, csv_filename):
                print(f"Skipping {csv_filename}, already exists.\n")
                continue

            region_page_param = page_param if is_global else f"{page_param}/{region}"

            print(f"Fetching leaderboard and tournament info from {region_page_param}...")
            html_text = fetch_page(region_page_param) 

            if html_text is None:
                continue

            placements = extract_placements(html_text)
            metadata = extract_metadata(html_text, base_url if is_global else f'{base_url}/{region}')

            save_to_csv(placements, metadata, folder_name, csv_filename)

        print(f"Finished scraping all region leaderboards for {folder_name.replace("_", " ")}\n")

if __name__ == "__main__":
    run()