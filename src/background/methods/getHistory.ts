const history = globalThis.browser?.history || globalThis.chrome?.history

export const getHistory = async ({
  text = "",
  maxResults = 20
}: {
  text?: string
  maxResults?: number
}) => {
  const items = await history.search({
    text,
    maxResults
  })
  return { success: true, entries: items }
}
