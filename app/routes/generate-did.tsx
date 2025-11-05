import { type ActionFunctionArgs } from 'react-router'

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Generate a simple DID for demo purposes
    const randomId = Math.random().toString(36).substr(2, 20)
    const did = `did:key:demo-${randomId}`
    
    return new Response(JSON.stringify({ 
      success: true, 
      did 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}