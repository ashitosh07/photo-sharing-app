import { type LoaderFunctionArgs } from 'react-router'
import PhotoService from '../../lib/photo-service.js'

const photoService = new PhotoService()

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { cid } = params
  const url = new URL(request.url)
  const proof = url.searchParams.get('proof')

  if (!cid || !proof) {
    return new Response('Missing CID or proof', { status: 400 })
  }

  try {
    const result = await photoService.accessPhoto(cid, proof, 'download')
    
    if (!result.success) {
      return new Response(result.error, { status: 403 })
    }

    return new Response(result.data, {
      headers: {
        'Content-Type': result.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`
      }
    })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}