export interface TeammateInfo {
    liquipedia_id: string
    display_name: string
}

export interface PlacementPlayerEntry {
    players: TeammateInfo
}

export interface TournamentInfo {
    name: string
    gamemode: string
    region: string
    start_date: string
    end_date: string
    total_teams: number
    max_teams: number
}

export interface RawPlacement {
    placement: number
    earnings: number
    placement_players: PlacementPlayerEntry[]
    tournaments: TournamentInfo
}

export interface RawPlacementPlayerRow {
    placements: RawPlacement
}

export interface PlacementRow {
    tournament_name: string
    gamemode: string
    region: string
    start_date: string
    end_date: string
    total_teams: number
    max_teams: number
    placement: number
    earnings: number
    teammates: TeammateInfo[]
    earningsPerPlayer: number
}

export interface AliasMatch {
    player_id: string
    players: TeammateInfo
}