export interface AvailableModel {
  id: string
  name: string
  description: string
  maxOutputs: number
  maxUploads: number
}

export const AVAILABLE_MODELS: AvailableModel[] = [
  {
    id: "openai/gpt-image-2",
    name: "openai/gpt-image-2",
    description:
      "OpenAI's state-of-the-art image generation model. Create and edit images from text with strong instruction following, sharp text rendering, and detailed editing.",
    maxOutputs: 10,
    maxUploads: 3,
  },
  {
    id: "black-forest-labs/flux-dev",
    name: "Flux Dev (Base)",
    description: "The official Flux 1 Dev model.",
    maxOutputs: 4,
    maxUploads: 1,
  },
];
