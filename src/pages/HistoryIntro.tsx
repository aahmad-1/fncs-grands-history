import HistoryLayout from '../components/HistoryLayout'

const HistoryIntro = () => (
    <HistoryLayout>
        <h1 className="text-3xl font-bold mb-4">What is FNCS?</h1>
        <p className="text-gray-300 leading-7 mb-4">
            FNCS (Fortnite Champion Series) is Fortnite's highest-stakes tournament, first held in Season X in 2019. It's run across multiple regions, usually seven, roughly once per season, with every iteration consisting of a set of qualifying rounds followed by a grand finals. As of the most recent Global Championship, 31 FNCS events have been held in total, 26 online seasonal events and 5 global LAN championships. The tournament was officially called the Fortnite Champion Series through 2023 and renamed the Fortnite Championship Series starting in 2024, keeping the same FNCS abbreviation throughout.
        </p>
        <p className="text-gray-300 leading-7 mb-4">
            FNCS carries real weight in competitive Fortnite's ongoing GOAT (greatest of all time) discussions, since grand finals wins and standout placements can be legacy-defining. Winners take home a cash prize and an in-game cosmetic pickaxe, originally called the Axe of Champions and now known as the Blade of Champions. See the Limitations page for why win totals alone don't tell the full story.
        </p>
        <h2 className="text-xl font-bold mt-8 mb-3">Why This Site Exists</h2>
        <p className="text-gray-300 leading-7">
            Sites like Fortnite Tracker and Liquipedia already track every FNCS grand finals leaderboard, but neither has a list of only the players who've actually qualified for one. Their player profiles don't filter down to just FNCS grands placements either, so there's no way to see at a glance which grands a player has played and which they've missed, without hunting down every individual leaderboard yourself. This project exists to fix that: one place, focused entirely on FNCS grand finals history, and built to support the GOAT debate with the actual data behind it.
        </p>
    </HistoryLayout>
)

export default HistoryIntro