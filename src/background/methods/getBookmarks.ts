const bookmarks = globalThis.browser?.bookmarks || globalThis.chrome?.bookmarks

export const getBookmarks = async ({ maxResults = 20 }: { maxResults?: number }) => {
  const tree = await bookmarks.getTree()

  const flatten = (nodes, collected = []) => {
    for (const node of nodes) {
      if (node.url) {
        collected.push({
          id: node.id,
          title: node.title,
          url: node.url,
          parentId: node.parentId
        })
      }
      if (node.children) {
        flatten(node.children, collected)
      }
    }
    return collected
  }

  return {
    success: true,
    bookmarks: flatten(tree).slice(0, maxResults)
  }
}
