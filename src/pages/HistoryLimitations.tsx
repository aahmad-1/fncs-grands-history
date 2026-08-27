import HistoryLayout from '../components/HistoryLayout'

const HistoryLimitations = () => (
    <HistoryLayout>
        <h1 className="text-3xl font-bold mb-4">Limitations</h1>
        <p className="text-gray-300 leading-7 mb-4">
            Win totals alone don't tell the full story. The players with the most and second-most FNCS wins come from regions generally considered less competitive, and their totals aren't weighted the same in most GOAT conversations as a result. Europe and North America Central are widely considered the toughest regions, carrying the most prize money and Global Championship qualifying spots. Some winners have also been carried by stronger teammates, some winning teams weren't even considered the favorites going in, and the best individual player in a tournament isn't always on the winning team. Placement counts are a starting point, best read alongside region, landing spot, and in-match performance, none of which this project currently tracks.
        </p>
        <ul className="list-disc list-inside text-gray-300 leading-7 space-y-2">
            <li>Only grand finals leaderboards are scraped. In some past seasons, players could also earn money during the qualifying rounds themselves, but that data isn't captured here.</li>
            <li>In-match performance stats like damage and eliminations aren't tracked, only final placements and earnings.</li>
            <li>Some data-quality issues in the underlying Liquipedia records have been manually corrected where found, but the dataset covers hundreds of tournaments across many years and there's no guarantee every edge case has been caught.</li>
        </ul>
    </HistoryLayout>
)

export default HistoryLimitations