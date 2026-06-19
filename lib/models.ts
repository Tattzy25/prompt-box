export interface AvailableModel {
  id: string
  name: string
  description: string
  maxOutputs: number
  maxUploads: number
  creditsPerOutput: number
}

// Card 1 (Generate) has no model selector — its model is the LoRA/version.
// Set the per-output credit cost for generations here (shown = this × num outputs).
export const GENERATE_CREDITS_PER_OUTPUT = 1

export const AVAILABLE_MODELS: AvailableModel[] = [
  {
    id: "See Dream - 5",
    name: "See Dream - 5",
    description:
      "Seedream 5.0 lite: image generation with built-in reasoning, example-based editing, and deep domain knowledge",
    maxOutputs: 6,
    maxUploads: 3,
    creditsPerOutput: 2,
  },
  {
    id: "black-forest-labs/flux-dev",
    name: "Flux Dev (Base)",
    description: "The official Flux 1 Dev model.",
    maxOutputs: 4,
    maxUploads: 1,
    creditsPerOutput: 1,
  },
];
