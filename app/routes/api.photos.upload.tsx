import { type ActionFunctionArgs } from 'react-router'
import PhotoService from '../../lib/photo-service.js'

const photoService = new PhotoService()

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File
    const ownerDID = formData.get('ownerDID') as string

    if (!file || !ownerDID) {
      return new Response(JSON.stringify({ error: 'Missing photo or ownerDID' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await photoService.uploadPhoto(
      await file.arrayBuffer(),
      file.name,
      ownerDID
    )

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}