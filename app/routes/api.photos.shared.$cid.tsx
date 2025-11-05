import { type LoaderFunctionArgs } from 'react-router'
import PhotoService from '../../lib/photo-service.js'

const photoService = new PhotoService()

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { cid } = params
  const url = new URL(request.url)
  const ownerDID = url.searchParams.get('ownerDID')

  if (!cid || !ownerDID) {
    return new Response(JSON.stringify({ error: 'Missing CID or ownerDID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get photo and check ownership
    const photos = photoService.listPhotos(ownerDID)
    const photo = photos.find(p => p.cid === cid)
    
    if (!photo) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get shared users from photo metadata
    const photoData = photoService.photos.get(cid)
    const sharedUsers = photoData ? photoData.sharedWith : []

    return new Response(JSON.stringify({ 
      success: true, 
      sharedUsers 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}