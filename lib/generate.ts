export async function generateImages(params: {
  prompt: string
  version: string
  sourceId: number | null
  numOutputs: number
  referenceImage: string | null
  customerId: string
  totalCredits: number
}) {
  const { prompt, version, sourceId, numOutputs, referenceImage, customerId, totalCredits } = params

  const res = await fetch("https://api.tattty.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      version,
      source_id: sourceId,
      numOutputs,
      uploads: referenceImage ?? "",
      customer_id: customerId,
      total_credits: String(totalCredits),
    }),
  })

  return res.json()
}
