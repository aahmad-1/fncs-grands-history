// some players share the same display name but have different liquipedia id's
// (different real people). if that happens, swap their name for their id instead
// so the user can actually tell them apart when theyre shown together

// this works on any list as long as it has these two fields, so both search results and rankings can reuse this
export const differentiateDisplayNames = <T extends { liquipedia_id: string, display_name: string }>(items: T[]): T[] => {
    const nameCounts = new Map<string, number>()
    items.forEach((item) => {
        nameCounts.set(item.display_name, (nameCounts.get(item.display_name) ?? 0) + 1)
    })

    return items.map((item) => {
        if ((nameCounts.get(item.display_name) ?? 0) > 1) {
            const cleanId = item.liquipedia_id.replace('/fortnite/', '').replace(/_/g, ' ')
            return { ...item, display_name: cleanId }
        }
        return item
    })
}