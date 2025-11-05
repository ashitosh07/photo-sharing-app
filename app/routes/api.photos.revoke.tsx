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
    const { photoCID, ownerDID, recipientDID } = await request.json()

    if (!photoCID || !ownerDID || !recipientDID) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = photoService.revokeAccess(photoCID, ownerDID, recipientDID)

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