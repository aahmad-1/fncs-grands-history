import HistoryLayout from '../components/HistoryLayout'

const HistoryTerminology = () => (
    <HistoryLayout>
        <h1 className="text-3xl font-bold mb-4">Terminology</h1>
        <p className="text-gray-300 leading-7 mb-4">
            Naming conventions have shifted over time. C2S3 refers to Chapter 2 Season 3, while C5M2 refers to Chapter 5 Major 2, since seasons started being called "majors" starting in Chapter 4.
        </p>
        <p className="text-gray-300 leading-7 mb-4">
            Regions have changed too. FNCS originally ran across seven regions: Europe, North America East, North America West, Brazil, Asia, Middle East, and Oceania. In 2023, North America East and West were combined into North America Central. In 2025, North America West returned as its own region alongside North America Central.
        </p>
        <p className="text-gray-300 leading-7">
            Rank requirements to enter FNCS have also changed across eras: Champion rank was required in early seasons, lowered to Contender in Chapters 4 and 5, then raised to Platinum starting in Chapter 4 Season 3.
        </p>
    </HistoryLayout>
)

export default HistoryTerminology