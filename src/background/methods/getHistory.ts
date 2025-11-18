const history = globalThis.browser?.history || globalThis.chrome?.history

type SortBy = "visit_time" | "visit_count" | "title"
type SortOrder = "asc" | "desc"

type GetHistoryParams = {
  keywords?: string
  startDate?: string
  endDate?: string
  domains?: string[]
  minVisitCount?: number
  maxResults?: number
  sortBy?: SortBy
  sortOrder?: SortOrder
}

export const getHistory = async ({
  keywords = "",
  startDate,
  endDate,
  domains = [],
  minVisitCount = 1,
  maxResults = 50,
  sortBy = "visit_time",
  sortOrder = "desc"
}: GetHistoryParams) => {
  const searchQuery: chrome.history.Query = {
    text: keywords,
    maxResults: Math.min(maxResults * 3, 1_000)
  }

  if (startDate) searchQuery.startTime = new Date(startDate).getTime()
  if (endDate) searchQuery.endTime = new Date(endDate).getTime()

  const rawEntries = await history.search(searchQuery)
  const filtered = rawEntries.filter((entry) => {
    if (domains.length > 0) {
      try {
        const hostname = new URL(entry.url).hostname
        if (!domains.some((domain) => hostname.includes(domain))) {
          return false
        }
      } catch {
        return false
      }
    }
    return !(entry.visitCount < minVisitCount)
  })

  filtered.sort((a, b) => {
    let left: number | string
    let right: number | string
    switch (sortBy) {
      case "visit_count":
        left = a.visitCount
        right = b.visitCount
        break
      case "title":
        left = (a.title || "").toLowerCase()
        right = (b.title || "").toLowerCase()
        break
      case "visit_time":
      default:
        left = a.lastVisitTime
        right = b.lastVisitTime
        break
    }
    if (left === right) return 0
    if (sortOrder === "asc") {
      return left > right ? 1 : -1
    }
    return left < right ? 1 : -1
  })

  const limited = filtered.slice(0, maxResults)
  const historyItems = limited.map((entry) => {
    let domain: string
    try {
      domain = new URL(entry.url).hostname
    } catch {
      domain = "invalid-url"
    }
    return {
      historyId: entry.id,
      url: entry.url,
      title: entry.title || "Untitled",
      lastVisitTime: new Date(entry.lastVisitTime).toISOString(),
      visitCount: entry.visitCount,
      domain,
      typedCount: entry.typedCount || 0
    }
  })

  return {
    success: true,
    historyItems,
    metadata: {
      total_found: filtered.length,
      returned_count: historyItems.length,
      search_params: {
        keywords: keywords || null,
        date_range: startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `from ${startDate}` : endDate ? `until ${endDate}` : null,
        domains: domains.length > 0 ? domains : null,
        minVisitCount,
        sortBy,
        sortOrder
      },
      execution_time: new Date().toISOString(),
      over_fetched: rawEntries.length,
      filters_applied: {
        domain_filter: domains.length > 0,
        visit_count_filter: minVisitCount > 1,
        date_filter: Boolean(startDate || endDate),
        keyword_filter: Boolean(keywords)
      }
    }
  }
}
