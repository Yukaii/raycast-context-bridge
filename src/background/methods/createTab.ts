const tabs = globalThis.browser?.tabs || globalThis.chrome?.tabs

export const createTab = async ({
  url,
  active = true
}: {
  url: string
  active?: boolean
}) => {
  const tab = await tabs.create({ url, active })
  return { success: true, tab }
}
