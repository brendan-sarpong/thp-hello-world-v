'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function captionTextFromRecord(record: any) {
  return (
    record?.content ??
    record?.text ??
    record?.caption_text ??
    record?.captionText ??
    ''
  )
}

export default function ImageUploadAndGenerate() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<any[] | null>(null)
  const [rawResponse, setRawResponse] = useState<any | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setGenerated(null)
    setRawResponse(null)
    setError(null)
  }

  async function onGenerate() {
    if (!file) return
    if (!file.type) {
      setError('Could not detect file type. Please use a supported image.')
      return
    }

    setLoading(true)
    setError(null)
    setGenerated(null)
    setRawResponse(null)

    try {
      setStatus('Step 1: Generate presigned upload URL…')
      const step1Res = await fetch('/api/pipeline/generate-presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: file.type }),
      })
      const step1Json = await step1Res.json().catch(() => null)
      if (!step1Res.ok || !step1Json?.presignedUrl || !step1Json?.cdnUrl) {
        throw new Error(step1Json?.error || 'Failed to generate upload URL')
      }

      const { presignedUrl, cdnUrl } = step1Json as {
        presignedUrl: string
        cdnUrl: string
      }

      setStatus('Step 2: Upload image bytes to presigned URL…')
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!putRes.ok) {
        throw new Error('Image upload failed')
      }

      setStatus('Step 3: Register uploaded image URL…')
      const step3Res = await fetch(
        '/api/pipeline/upload-image-from-url',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
        },
      )
      const step3Json = await step3Res.json().catch(() => null)
      if (!step3Res.ok || !step3Json?.imageId) {
        throw new Error(step3Json?.error || 'Failed to register image')
      }

      const { imageId } = step3Json as { imageId: string }

      setStatus('Step 4: Generate captions…')
      const step4Res = await fetch('/api/pipeline/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      })

      const step4Json = await step4Res.json().catch(() => null)
      if (!step4Res.ok) {
        throw new Error(step4Json?.error || 'Failed to generate captions')
      }

      setRawResponse(step4Json)

      const maybeArray =
        (Array.isArray(step4Json) && step4Json) ||
        step4Json?.captions ||
        step4Json?.data ||
        step4Json?.results ||
        null

      setGenerated(Array.isArray(maybeArray) ? maybeArray : null)
      setStatus('Done')
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setTimeout(() => setStatus(null), 3500)
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generate Captions</h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload an image to generate new captions. Requires sign-in.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Supported: JPG, PNG, WEBP, GIF, HEIC
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="block text-sm font-medium text-slate-200">
            Choose an image
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={onFileChange}
            disabled={loading}
            className="mt-2 w-full text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-sky-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100 hover:file:bg-sky-500/25 disabled:opacity-50"
          />
          {file && (
            <p className="mt-2 text-xs text-slate-400">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!file || loading}
          className="h-10 w-full rounded-full bg-sky-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50 sm:w-auto"
        >
          {loading ? 'Generating…' : 'Generate Captions'}
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {generated && generated.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-200">
            Generated captions
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {generated.slice(0, 6).map((record, idx) => {
              const text = captionTextFromRecord(record) || '(no caption text)'
              return (
                <div
                  key={record?.id ?? record?.caption_id ?? idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <p className="line-clamp-5 text-sm leading-relaxed text-slate-100">
                    {text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {rawResponse && (
        <details className="mt-6">
          <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
            View raw caption generation response
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-[0.7rem] text-slate-300">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </details>
      )}
    </section>
  )
}

