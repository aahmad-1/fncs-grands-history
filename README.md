# FNCS Grands History

A full-stack site tracking every FNCS Grand Finals iteration in Fortnite competitive history, including every region it ran in, and every player that's qualified for a grand finals.

**Live site:** [fncshistory.pages.dev](https://fncshistory.pages.dev/)
## Overview

FNCS Grands History scrapes tournament results directly from Liquipedia, normalizes them into a relational database, and displays them through a searchable and filterable web app. It covers every Grand Finals from Season X to the latest one (C7M2 as of writing this), across every possible region, with full player profiles, tournament pages, and a sortable player rankings leaderboard. Updated every FNCS!

## Why I Built This

Sites like Fortnite Tracker and Liquipedia already track every FNCS grand finals leaderboard, but neither has a list of only the players who've actually qualified for one. Their player profiles don't filter down to just FNCS grands placements either, so there's no way to see at a glance which grands a player has played, and which they've missed, without hunting down every individual leaderboard yourself. Both sites can also feel slow and heavy for something this specific. This project exists to fix that by hosting one place focused entirely on FNCS grand finals history, fast to browse, and built to support the GOAT debate with the actual data behind it instead of scattered results.

## What is FNCS?

FNCS (Fortnite Champion Series) is a high-stakes Fortnite tournament that first began in Season X. It's split across multiple regions (usually seven) and typically runs once per Fortnite season. FNCS carries heavy weight in competitive Fortnite's ongoing GOAT (greatest of all time) discussions, since grand finals wins and exceptional placement results can be legacy-defining. However, win totals alone don't tell the full story. Read more on the [History](https://fncshistory.pages.dev/history) page of FNCS Grands History.

## Limitations

- Only grand finals leaderboards are scraped. In some past iterations, players could also earn money during the qualifying rounds themselves, but that data isn't accounted for.
- In-match performance stats (damage, eliminations, etc.) aren't tracked, only final placements and earnings.
- Some data-quality issues in the underlying Liquipedia records (like disqualified teams affecting posted placements) have been manually corrected where found, but the dataset covers hundreds of tournaments across many years and there's no guarantee every edge case has been caught.

## Features

- Search and browse every player who's ever qualified for an FNCS Grand Finals
- Full player profile pages with placement history, teammates, earnings, and per-gamemode averages, filterable by gamemode, date range, and qualification status
- Browse tournaments by chapter with gamemode filtering
- Individual tournament pages with full leaderboards and region switching
- Player rankings sortable by wins, top finishes, average placement, and total earnings
- Handles edge cases from Liquipedia's records, including disqualified teams, redlinked players without wiki pages, and lans that invited more teams than could fit in the actual grand finals lobby

## Screenshots

<table style="border: none; border-collapse: collapse;">
  <tr>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/home.png" target="_blank">
        <img src="docs/screenshots/home.png" width="400">
      </a>
    </td>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/players.png" target="_blank">
        <img src="docs/screenshots/players.png" width="400">
      </a>
    </td>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/player-profile.png" target="_blank">
        <img src="docs/screenshots/player-profile.png" width="400">
      </a>
    </td>
  </tr>
  <tr>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/tournaments.png" target="_blank">
        <img src="docs/screenshots/tournaments.png" width="400">
      </a>
    </td>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/tournament-page.png" target="_blank">
        <img src="docs/screenshots/tournament-page.png" width="400">
      </a>
    </td>
    <td style="border: none;">
      <a href="https://raw.githubusercontent.com/aahmad-1/fncs-grands-history/refs/heads/main/docs/screenshots/rankings.png" target="_blank">
        <img src="docs/screenshots/rankings.png" width="400">
      </a>
    </td>
  </tr>
</table>

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router  
**Backend/Database:** Supabase (PostgreSQL), Row Level Security, SQL views  
**Data Pipeline:** Python, BeautifulSoup, requests  
**Hosting:** Cloudflare Pages

## Project Structure

```text
fncs-grands-history
├─ scraper/         Scraping pipeline (Liquipedia MediaWiki API)
├─ database/        SQL schemas & queries
├─ data/cleaned/    Scraped tournament results as CSVs
├─ src/             Frontend
└─ public/          Static assets
```

## Local Setup

### Prerequisites

- Node.js
- Python 3.10+
- A Supabase project

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/aahmad-1/fncs-grands-history.git
cd fncs-grands-history
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Install scraper dependencies**

```bash
pip install -r requirements.txt
```

**4. Set up the database**

Create a new project in Supabase and run `database/schema.sql` in the SQL Editor to create all tables, policies, and views.

**5. Configure environment variables**

Create `.env` in the project root:

```env
DATABASE_URL=your_database_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- Follow [this guide](https://www.youtube.com/watch?v=4gUx-S3X66M) to get the `DATABASE_URL`, replace `[YOUR PASSWORD]` with your database password
- Follow [this guide](https://www.youtube.com/watch?v=TDiOzWWTnaQ) to get the `VITE_SUPABASE_URL`, remove `/rest/v1/` from it
- Follow [this guide](https://www.youtube.com/watch?v=j3sSJJ_S1UQQ) to get the `VITE_SUPABASE_ANON_KEY`

### Running the app

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Reproducing the Scrape

The scraper is fully configurable through `scraper/config.py`:

- **`USER_AGENT`** — set this to your own project name and contact info. Liquipedia requires a descriptive user agent on every request.
- **`LIQUIPEDIA_URLS`** — comment out any tournament URLs you don't want to scrape.
- **`NON_NA_REGIONS`** and **`REGION_URL_PARTS`** — comment out any regions you don't want to scrape.
- **`SLEEP_SECONDS`** — feel free to increase above 30, but do not decrease this. 30 seconds is needed to comply with Liquipedia's rate limits.

Before scraping, I suggest reading and following the [Liquipedia API Terms of Use](https://liquipedia.net/api-terms-of-use).

Once configured, run:

```bash
python scraper/main.py
```

Then load the scraped data into Supabase:

```bash
python database/load_data.py
```

## Acknowledgements

- [Liquipedia Fortnite](https://liquipedia.net/fortnite/) — the source of all tournament, player, and earnings data used in this project
- [react-icons](https://react-icons.github.io/react-icons/) for any icons used throughout the UI