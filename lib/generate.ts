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
      numOutputs,
      uploads: referenceImage ?? "",
      customer_id: customerId,
      total_credits: String(totalCredits),
    }),
  })

  return res.json()
}

export async function editImages(params: {
  editPrompt: string
  editUpload1: string
  editUpload2: string
  editUpload3: string
  model: string
  numOutputs: number
  customerId: string
  totalCredits: number
}) {
  const {
    editPrompt,
    editUpload1,
    editUpload2,
    editUpload3,
    model,
    numOutputs,
    customerId,
    totalCredits,
  } = params

  const res = await fetch("https://api.tattty.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      edit_prompt: editPrompt,
      edit_upload1: editUpload1,
      edit_upload2: editUpload2,
      edit_upload3: editUpload3,
      model,
      numOutputs,
      customer_id: customerId,
      total_credits: String(totalCredits),
    }),
  })

  return res.json()
}
