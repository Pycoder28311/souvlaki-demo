"use client"

import { useState } from "react"
import Image from "next/image"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)

    if (selected) {
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (res.ok) {
      setMessage("✅ Uploaded successfully! Image ID: " + data.id)
    } else {
      setMessage("❌ Error: " + data.error)
    }

    setUploading(false)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload an Image</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full border p-2 rounded"
        />

        {preview && (
          <div className="mt-4">
            <p className="text-sm mb-1">Preview:</p>
            <Image
              src={preview}
              alt="preview"
              fill
              className="rounded shadow object-contain" // or object-cover if you prefer cropping
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
