import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { getSession } from '@/lib/auth/session'
import { unauthorized, badRequest, serverError, created } from '@/lib/api/response'

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov']
const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 500

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
  'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm',
  'video/quicktime': 'mov', 'video/mov': 'mov',
}

async function uploadToCloudinary(buffer: ArrayBuffer, mime: string, isVideo: boolean): Promise<string> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET no están configurados')
  }

  const resourceType = isVideo ? 'video' : 'image'
  const folder = isVideo ? 'edumarket/videos' : 'edumarket/images'

  const timestamp = Math.floor(Date.now() / 1000)

  // Signature must exclude: file, api_key, cloud_name, resource_type
  const signStr = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(signStr))
  const signature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

  const formData = new FormData()
  const blob = new Blob([buffer], { type: mime })
  formData.append('file', blob)
  formData.append('folder', folder)
  formData.append('timestamp', String(timestamp))
  formData.append('api_key', CLOUDINARY_API_KEY)
  formData.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudinary error: ${err}`)
  }
  const result = await res.json() as { secure_url: string }
  return result.secure_url
}

async function uploadToLocalFs(buffer: ArrayBuffer, mime: string, isImage: boolean): Promise<string> {
  const folder = isImage ? 'images' : 'videos'
  const ext = EXT[mime] ?? 'bin'
  const filename = `${randomUUID()}.${ext}`
  const dir = join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), Buffer.from(buffer))
  return `/uploads/${folder}/${filename}`
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !file.name) return badRequest('No se recibió ningún archivo')

    const mime = file.type
    const isImage = IMAGE_TYPES.includes(mime)
    const isVideo = VIDEO_TYPES.includes(mime)
    if (!isImage && !isVideo) return badRequest(`Tipo de archivo no permitido: ${mime}`)

    const maxBytes = isImage ? MAX_IMAGE_MB * 1024 * 1024 : MAX_VIDEO_MB * 1024 * 1024
    if (file.size > maxBytes) {
      return badRequest(`El archivo supera el límite de ${isImage ? MAX_IMAGE_MB : MAX_VIDEO_MB} MB`)
    }

    const bytes = await file.arrayBuffer()

    const isProduction = process.env.NODE_ENV === 'production'
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    let url: string
    if (isProduction && !hasCloudinary) {
      return badRequest('Subida de archivos no configurada. Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.')
    }

    if (isProduction && hasCloudinary) {
      url = await uploadToCloudinary(bytes, mime, isVideo)
    } else {
      // En desarrollo siempre usa el filesystem local (más rápido y sin dependencias externas)
      url = await uploadToLocalFs(bytes, mime, isImage)
    }

    return created({ url, filename: file.name, size: file.size, type: mime })
  } catch (e) {
    console.error('[upload]', e)
    if (e instanceof Error) return badRequest(e.message)
    return serverError()
  }
}
