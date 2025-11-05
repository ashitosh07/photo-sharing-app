import { type LoaderFunctionArgs } from 'react-router'
import { useLoaderData, useSearchParams } from 'react-router'
import PhotoService from '../../lib/photo-service.js'

const photoService = new PhotoService()

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { cid } = params
  const url = new URL(request.url)
  const proof = url.searchParams.get('proof')

  if (!cid || !proof) {
    throw new Response('Missing CID or proof', { status: 400 })
  }

  try {
    const result = await photoService.accessPhoto(cid, proof, 'view')
    
    if (!result.success) {
      throw new Response(result.error, { status: 403 })
    }

    return new Response(JSON.stringify({ ...result, cid }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    throw new Response(error.message, { status: 500 })
  }
}

export default function PhotoView() {
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const proof = searchParams.get('proof')
  
  // Decode proof to check capabilities
  let capabilities = []
  try {
    const decodedProof = JSON.parse(atob(proof))
    capabilities = decodedProof.capabilities || []
  } catch (e) {
    console.error('Failed to decode proof:', e)
  }
  
  const canDownload = capabilities.includes('download')
  const canView = capabilities.includes('view')

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/photos/download/${data.cid}?proof=${proof}`)
      
      if (!response.ok) {
        alert('Download failed: ' + await response.text())
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Download failed: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">{data.filename}</h1>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📅 Uploaded: {new Date(data.metadata.uploadedAt).toLocaleDateString()}</p>
              <p>👤 Shared by: {data.metadata.sharedBy}</p>
              <p>🆔 CID: {data.cid}</p>
              <p>🔐 Your permissions: {capabilities.join(', ') || 'none'}</p>
            </div>
          </div>
          
          <div className="mb-6 text-center">
            <img 
              src={data.url} 
              alt={data.filename}
              className="max-w-full h-auto rounded-lg shadow-lg border mx-auto"
              style={{ maxHeight: '70vh' }}
            />
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            {canDownload ? (
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                💾 Download Photo
              </button>
            ) : (
              <div className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                🚫 Download Not Permitted
              </div>
            )}
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Share link copied to clipboard!')
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              📋 Copy Share Link
            </button>
            
            <a
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium inline-block"
            >
              🏠 Back to App
            </a>
          </div>
          
          {!canDownload && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Limited Access:</strong> You only have permission to view this photo. 
                To download it, ask the owner to share it again with download permissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}