import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
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
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  const folder = isVideo ? 'edumarket/videos' : 'edumarket/images'
  const resourceType = (isVideo ? 'video' : 'image') as 'video' | 'image'
  const buf = Buffer.from(buffer)

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error)
        if (!result?.secure_url) return reject(new Error('Cloudinary no devolvió URL'))
        resolve(result.secure_url)
      }
    )
    stream.end(buf)
  })
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
    if (!file) return badRequest('No se recibió ningún archivo')

    const mime = file.type || 'application/octet-stream'
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
      return badRequest('Variables de entorno de Cloudinary no configuradas en Netlify.')
    }

    if (isProduction && hasCloudinary) {
      url = await uploadToCloudinary(bytes, mime, isVideo)
    } else {
      url = await uploadToLocalFs(bytes, mime, isImage)
    }

    return created({ url, filename: file.name, size: file.size, type: mime })
  } catch (e: unknown) {
    console.error('[upload]', JSON.stringify(e))
    if (e instanceof Error) return badRequest(e.message)
    // Cloudinary SDK throws plain objects: { error: { message: '...' } }
    const cldMsg = (e as any)?.error?.message ?? (e as any)?.message
    if (typeof cldMsg === 'string') return badRequest(cldMsg)
    return serverError()
  }
}
