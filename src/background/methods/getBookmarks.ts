const bookmarks = globalThis.browser?.bookmarks || globalThis.chrome?.bookmarks

export const getBookmarks = async ({ query }: { query?: string } = {}) => {
  const results = query ? await bookmarks.search(query) : await bookmarks.getTree()
  return {
    success: true,
    bookmarks: results,
    count: results.length
  }
}
