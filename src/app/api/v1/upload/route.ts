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

    const folder = isImage ? 'images' : 'videos'
    const ext = EXT[mime] ?? 'bin'
    const filename = `${randomUUID()}.${ext}`
    const dir = join(process.cwd(), 'public', 'uploads', folder)

    await mkdir(dir, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(join(dir, filename), Buffer.from(bytes))

    const url = `/uploads/${folder}/${filename}`
    return created({ url, filename, size: file.size, type: mime })
  } catch (e) {
    console.error('[upload]', e)
    return serverError()
  }
}
