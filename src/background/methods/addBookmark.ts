const bookmarks = globalThis.browser?.bookmarks || globalThis.chrome?.bookmarks

export const addBookmark = async ({
  title,
  url,
  parentId
}: {
  title: string
  url: string
  parentId?: string
}) => {
  const bookmark = await bookmarks.create({ title, url, parentId })
  return { success: true, bookmark }
}
