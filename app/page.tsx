"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info, ImageIcon, Loader2, Download, Link as LinkIcon, X, Copy, Share2 } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { toast } from "sonner"
import { generateImages, editImages } from "@/lib/generate"
import { AVAILABLE_MODELS, GENERATE_CREDITS_PER_OUTPUT } from "@/lib/models"
import { useIframeAutoResize } from "@/hooks/use-iframe-autoresize"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function InfoHint({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Info
          className="h-4 w-4 text-muted-foreground cursor-pointer"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => {
            e.preventDefault()
            setOpen((o) => !o)
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-xs text-sm"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

function LabelWithTooltip({ id, label, tooltip }: { id?: string, label: string, tooltip: string }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id}>{label}</Label>
      <InfoHint>{tooltip}</InfoHint>
    </div>
  )
}

export default function Home() {
  const [numOutputs, setNumOutputs] = useState(4)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  
  // Share State
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareFile, setShareFile] = useState<File | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [isPreparingShare, setIsPreparingShare] = useState(false)

  // Form State
  const [ModelId, setModelId] = useState(AVAILABLE_MODELS[0].id)
  const [prompt, setPrompt] = useState("")
  const [triggerWord, setTriggerWord] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [version, setVersion] = useState("")
  const [outputQuality, setOutputQuality] = useState(80)
  const [disableSafetyChecker] = useState(true)
  const [promptStrength, setPromptStrength] = useState(0.8)

  // Edit (Card 2) State
  const [editModelId, setEditModelId] = useState(AVAILABLE_MODELS[0].id)
  const [editPrompt, setEditPrompt] = useState("")
  const [editNumOutputs, setEditNumOutputs] = useState(10)
  const [referenceImageInvalid, setReferenceImageInvalid] = useState(false)
  const [editPictureInvalid, setEditPictureInvalid] = useState(false)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [editPictures, setEditPictures] = useState<string[]>([])

  const getDimensions = () => {
    if (aspectRatio === "custom") return { w: width, h: height }
    const [w, h] = aspectRatio.split(":").map(Number)
    // Base scale on 1024px
    return { w: 1024, h: Math.round(1024 * (h / w)) }
  }

  const getAspectRatioStyle = (ratio: string) => {
    if (ratio === "custom") return { aspectRatio: `${width} / ${height}` }
    const [w, h] = ratio.split(":").map(Number)
    return { aspectRatio: `${w} / ${h}` }
  }

    useEffect(() => {
      const q = new URLSearchParams(window.location.search);
      setTriggerWord(q.get("trigger_word") ?? "");
      setCustomerId(q.get("customer_id") ?? "");
      setVersion(q.get("version") ?? "");
    }, []); 



  useIframeAutoResize()

  const editModel =
    AVAILABLE_MODELS.find((m) => m.id === editModelId) ?? AVAILABLE_MODELS[0]

  const totalCredits = (numOutputs || 0) * GENERATE_CREDITS_PER_OUTPUT
  const editTotalCredits = editNumOutputs * editModel.creditsPerOutput
  const handleGenerate = async () => {
    if (isLoading) return // Prevent double clicks


    setIsLoading(true)
    setIsGenerated(false)
    setGeneratedImages([])

    const data = await generateImages({
      prompt,
      version,
      numOutputs,
      referenceImage,
      customerId,
      totalCredits,
    })
    setGeneratedImages(data.urls)
    setIsGenerated(true)
    setIsLoading(false)
  }

  const handleEdit = async () => {
    if (isEditing) return
    if (editPrompt.trim().length < 10) {
      toast.error("Prompt must be at least 10 characters")
      return
    }
    setIsEditing(true)
    setIsGenerated(false)
    setGeneratedImages([])

    const data = await editImages({
      editPrompt,
      editUpload1: editPictures[0] ?? "",
      editUpload2: editPictures[1] ?? "",
      editUpload3: editPictures[2] ?? "",
      model: editModel.name,
      numOutputs: editNumOutputs,
      customerId,
      totalCredits: (editNumOutputs || 0) * editModel.creditsPerOutput,
    })
    setGeneratedImages(data.urls)
    setIsGenerated(true)
    setIsEditing(false)
  }

  const handleDownload = async (url: string, index: number) => {
    try {
      const filename = `generated-image-${index + 1}.${outputFormat}`
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${filename}`)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success("Image downloaded successfully")
    } catch (error) {
      console.error('Download failed:', error)
      toast.error("Download failed. Please try again.")
    }
  }

  const handleShare = async (url: string, index: number) => {
    const filename = `generated-image-${index + 1}.${outputFormat}`
    setShareUrl(url)
    
    // Check if we can share files
    if (navigator.canShare && navigator.canShare({ files: [new File([], 'test.png')] })) {
      setIsPreparingShare(true)
      toast.info("Preparing image for sharing...")
      
      try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&filename=${filename}`)
        if (response.ok) {
          const blob = await response.blob()
          const file = new File([blob], filename, { type: blob.type })
          setShareFile(file)
          setShareDialogOpen(true)
          setIsPreparingShare(false)
          return
        }
      } catch (error) {
        console.warn("File preparation failed", error)
      }
      setIsPreparingShare(false)
    }

    // Fallback to Link Sharing immediately if file sharing isn't supported or failed
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'GoKAnI AI Generation',
          text: 'Check out this image I generated with GoKAnI AI!',
          url: url
        })
        toast.success("Shared link successfully")
        return
      }
    } catch (error) {
      console.warn("Link sharing failed", error)
    }

    // Fallback to Clipboard
    try {
      await navigator.clipboard.writeText(url)
      toast.info("Sharing failed, link copied to clipboard instead!")
    } catch (clipboardError) {
      toast.error("Failed to share. Try downloading instead.")
    }
  }

  const executeShare = async () => {
    if (!shareFile) return
    
    try {
      await navigator.share({
        title: 'GoKAnI AI Generation',
        text: 'Check out this image I generated with GoKAnI AI!',
        files: [shareFile]
      })
      toast.success("Shared image successfully")
      setShareDialogOpen(false)
    } catch (error: any) {
      console.warn("Share execution failed", error)
      
      // If user cancelled, just close dialog
      if (error.name === 'AbortError') {
        setShareDialogOpen(false)
        return
      }

      // Fallback to link sharing
      if (shareUrl) {
        try {
          await navigator.share({
            title: 'image-gen',
            text: 'Check out this image I generated with GoKAnI AI!',
            url: shareUrl
          })
          setShareDialogOpen(false)
          return
        } catch (e) {
           // ignore
        }
      }
      
      toast.error("Sharing failed. Try downloading instead.")
      setShareDialogOpen(false)
    }
  }

  const handleDownloadAll = async () => {
    toast.info("Starting download of all images...")
    for (let i = 0; i < generatedImages.length; i++) {
      await handleDownload(generatedImages[i], i)
      // Small delay to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const { w, h } = getDimensions()
  const slides = generatedImages.map((src) => ({
    src,
    width: w,
    height: h,
  }))

  return (
    <div className="flex flex-col w-full">
      <div className="w-full py-10 px-[5px] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Generate Images */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-orbitron)]">
                Generate Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="space-y-2 flex-1">
                  <LabelWithTooltip
                    label="Trigger"
                    tooltip='A trigger word is a "secret password" required to activate the Model specific training and generate the exact image style.'
                  />
                  <div className="flex items-center gap-2">
                    <p className="font-[family-name:var(--font-orbitron)] text-sm">
                      trigger word : {triggerWord}
                    </p>
                    <button
                      type="button"
                      aria-label="Add trigger word to prompt"
                      onClick={() => {
                        setPrompt((prev) =>
                          prev ? `${prev} ${triggerWord}` : triggerWord,
                        );
                        toast.success("Trigger word added to prompt");
                      }}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="space-y-2 w-32">
                    <LabelWithTooltip
                      id="num_outputs"
                      label="Num Outputs"
                      tooltip="Number of outputs to generate"
                    />
                    <Input
                      id="num_outputs"
                      type="number"
                      min={1}
                      max={4}
                      value={numOutputs}
                      onChange={(e) => setNumOutputs(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2 w-32">
                    <LabelWithTooltip
                      label="Total Credits"
                      tooltip="Total credits for this request: cost per image × number of outputs."
                    />
                    <div className="flex h-9 w-full items-center justify-center rounded-md border bg-transparent text-sm font-medium shadow-xs">
                      {totalCredits}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip
                  id="prompt"
                  label="Prompt"
                  tooltip="Prompt for generated image. If you include the `trigger_word` used in the training process you are more likely to activate the trained object, style, or concept in the resulting image."
                />
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here..."
                  className="h-24"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Field data-invalid={referenceImageInvalid ? "" : undefined}>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="referenceImage">
                    Reference Image (Optional)
                  </FieldLabel>
                  <InfoHint>
                    Upload 1 reference image max for better quality.
                  </InfoHint>
                </div>
                <Input
                  id="referenceImage"
                  type="file"
                  className="mt-2"
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={referenceImageInvalid || undefined}
                  disabled={!!referenceImage}
                  onChange={async (e) => {
                    const input = e.target;
                    const f = input.files?.[0];
                    if (!f) return;
                    const ext = f.name.split(".").pop()?.toLowerCase();
                    if (!["jpg", "jpeg", "png", "webp"].includes(ext ?? "")) {
                      setReferenceImageInvalid(true);
                      return;
                    }
                    setReferenceImageInvalid(false);
                    const res = await fetch(
                      "https://model.avi-kay2019.workers.dev",
                      {
                        method: "POST",
                        headers: {
                          "X-File-Type": "image",
                          "Content-Type": "image/png",
                        },
                        body: f,
                      },
                    );
                    const data = await res.json();
                    setReferenceImage(data.url);
                    input.value = "";
                  }}
                />
                <FieldDescription>Select a picture to upload.</FieldDescription>
                {referenceImage && (
                  <div className="flex flex-wrap gap-2">
                    <div className="relative h-20 w-20">
                      <img
                        src={referenceImage}
                        alt=""
                        className="h-20 w-20 rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setReferenceImage(null)}
                        className="absolute -right-2 -top-2 rounded-full border bg-background p-0.5 shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Field>
            </CardContent>
            <CardFooter className="flex-col gap-4 justify-center pb-6">
              <Button
                size="lg"
                className={cn(
                  "w-full max-w-md font-[family-name:var(--font-rock-salt)] leading-none text-[24px] md:text-[32px] transition-transform active:scale-95",
                  isLoading && "opacity-50 cursor-not-allowed active:scale-100",
                )}
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  "GENERATE NOW"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Edit Images */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-orbitron)]">
                Edit Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2 flex-1">
                  <LabelWithTooltip
                    id="model_edit"
                    label="Model"
                    tooltip="Select the specific model to use for generation."
                  />
                  <Select
                    value={editModelId}
                    onValueChange={(val: string) => setEditModelId(val)}
                  >
                    <SelectTrigger id="model_edit">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-4">
                  <div className="space-y-2 w-32">
                    <LabelWithTooltip
                      id="num_outputs_edit"
                      label="Num Outputs"
                      tooltip="Number of outputs to generate"
                    />
                    <Input
                      id="num_outputs_edit"
                      type="number"
                      min={1}
                      max={editModel.maxOutputs}
                      value={editNumOutputs}
                      onChange={(e) =>
                        setEditNumOutputs(parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2 w-32">
                    <LabelWithTooltip
                      label="Total Credits"
                      tooltip="Total credits for this request: cost per image × number of outputs."
                    />
                    <div className="flex h-9 w-full items-center justify-center rounded-md border bg-transparent text-sm font-medium shadow-xs">
                      {(editNumOutputs || 0) * editModel.creditsPerOutput}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <LabelWithTooltip
                    id="prompt_edit"
                    label="Prompt"
                    tooltip="Prompt for generated image. If you include the `trigger_word` used in the training process you are more likely to activate the trained object, style, or concept in the resulting image."
                  />
                </div>
                <Textarea
                  id="prompt_edit"
                  placeholder="Enter your prompt here..."
                  className="h-24"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                />
              </div>
              <Field data-invalid={editPictureInvalid ? "" : undefined}>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="picture_edit">Image Uploads</FieldLabel>
                  <InfoHint>
                    Up to 4 images for better quality. Some models may allow
                    fewer, some more.
                  </InfoHint>
                </div>
                <Input
                  id="picture_edit"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={editPictureInvalid || undefined}
                  disabled={editPictures.length >= editModel.maxUploads}
                  onChange={async (e) => {
                    const input = e.target;
                    const files = Array.from(input.files ?? []);
                    const valid = files.filter((f) =>
                      ["jpg", "jpeg", "png", "webp"].includes(
                        f.name.split(".").pop()?.toLowerCase() ?? "",
                      ),
                    );
                    setEditPictureInvalid(valid.length !== files.length);
                    const urls = await Promise.all(
                      valid.map(async (f) => {
                        const res = await fetch(
                          "https://model.avi-kay2019.workers.dev",
                          {
                            method: "POST",
                            headers: {
                              "X-File-Type": "image",
                              "Content-Type": "image/png",
                            },
                            body: f,
                          },
                        );
                        const data = await res.json();
                        return data.url as string;
                      }),
                    );
                    setEditPictures((prev) =>
                      [...prev, ...urls].slice(0, editModel.maxUploads),
                    );
                    input.value = "";
                  }}
                />
                <FieldDescription>
                  Select up to {editModel.maxUploads} pictures to upload.
                </FieldDescription>
                {editPictures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editPictures.map((src, i) => (
                      <div key={i} className="relative h-20 w-20">
                        <img
                          src={src}
                          alt=""
                          className="h-20 w-20 rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditPictures((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute -right-2 -top-2 rounded-full border bg-background p-0.5 shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </CardContent>
            <CardFooter className="flex-col gap-4 justify-center pb-6">
              <Button
                size="lg"
                className={cn(
                  "w-full max-w-md font-[family-name:var(--font-rock-salt)] leading-none text-[24px] md:text-[32px] transition-transform active:scale-95",
                  isEditing && "opacity-50 cursor-not-allowed active:scale-100",
                )}
                onClick={handleEdit}
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    EDITING...
                  </>
                ) : (
                  "EDIT NOW"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator className="bg-black" />

        <div className="flex flex-col items-center pb-12">
          {isLoading || isEditing ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">
                Creating your masterpiece...
              </p>
            </div>
          ) : (
            <>
              {generatedImages.length > 1 && (
                <Button
                  onClick={handleDownloadAll}
                  variant="secondary"
                  className="mb-8"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All ({generatedImages.length})
                </Button>
              )}
              <div className="flex flex-wrap justify-center items-center gap-8">
                {generatedImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg border bg-muted/30 p-2"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(i);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={src}
                        alt={`Generated image ${i + 1}`}
                        className="block w-full h-auto object-contain rounded-lg"
                      />
                    </div>

                    <div className="flex gap-2 w-full max-w-md mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(src, i)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleShare(src, i)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={slides}
        />

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ready to Share</DialogTitle>
              <DialogDescription>
                Your image has been prepared. Click the button below to share
                it.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={executeShare}>Share Now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}