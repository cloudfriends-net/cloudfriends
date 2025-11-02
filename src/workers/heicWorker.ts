// A tiny Web Worker to decode HEIC/HEIF to an image blob using heic2any
// It receives a File/Blob via postMessage and returns a Blob URL or an error.

// Note: Workers run in a different context; use importScripts for UMD builds.
// heic2any publishes a UMD build we can import via importScripts with bundlers.

// Typed loosely to avoid requiring webworker lib types in the project
const ctx: any = self as any

let heic2anyLoaded = false

async function ensureHeic2Any() {
  if (heic2anyLoaded) return
  // When bundled by Next/Turbopack, this will be resolved at build time
  const mod = await import('heic2any')
  ;(ctx as any).heic2any = (mod as any).default
  heic2anyLoaded = true
}

ctx.onmessage = async (e: MessageEvent) => {
  const { id, file } = e.data as { id: string; file: Blob }
  try {
    await ensureHeic2Any()
    const result = await (ctx as any).heic2any({ blob: file, toType: 'image/png', quality: 0.92 })
    const blob: Blob = Array.isArray(result) ? result[0] : result
    const reader = new FileReader()
    reader.onload = () => {
      ctx.postMessage({ id, ok: true, arrayBuffer: reader.result }, [reader.result as ArrayBuffer])
    }
    reader.onerror = () => ctx.postMessage({ id, ok: false, error: 'Failed to read blob' })
    reader.readAsArrayBuffer(blob)
  } catch (error) {
    ctx.postMessage({ id, ok: false, error: (error as Error).message })
  }
}
