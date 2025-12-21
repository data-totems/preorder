import { ImageIcon, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { useRef, useState } from "react"
import { storage } from "@/actions/storage.actions"
import {  Permission, Role  } from 'appwrite'
import { toast } from "sonner"

const ImageUploader = ({ value, onChange }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isLoading, setIsLoading] = useState(false)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange =  async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }
    setIsLoading(true)

    try {
        const uploadImage = await storage.createFile({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId: Date.now().toString(),
    file: file,
    permissions: [Permission.read(Role.any())]
});
const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_BASE_URI}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${uploadImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    setPreview(imageUrl)
    onChange(imageUrl)

    toast.success('Image Uploaded')
    } catch (error) {
      toast.error(`Error occured while uploading image`)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Preview box */}
      <div className="bg-[#F0F0F0] w-[72px] h-[72px] rounded-[12px] flex items-center justify-center overflow-hidden">
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <>
          {isLoading ? <Loader2 className="animate-spin text-green-500" /> :<ImageIcon className="text-[#D9D9D9]" /> }
          </>
          
        )}
      </div>

      <Button
        variant="ghost"
        className="text-[#27BA5F]"
        onClick={handleUploadClick}
        type="button"
        disabled={isLoading}
      >
        Upload{isLoading && 'ing'} Image
      </Button>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default ImageUploader
