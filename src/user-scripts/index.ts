import { listen } from "@plasmohq/messaging/message"

listen(async (req, res) => {
  if (req.body?.target !== "user-script") return
  if (req.name !== "executeJS") return
  if (!req.body?.script) throw Error("No script provided")

  const result = await eval(req.body.script)
  res.send({ result: result?.toString(), success: true })
})
