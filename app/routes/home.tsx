import { useState } from 'react'
import type { Route } from "./+types/home"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Decentralized Photo Sharing" },
    { name: "description", content: "Share photos securely with UCANs and Storacha" },
  ]
}

export default function Home() {
  const [userDID, setUserDID] = useState('')
  const [photos, setPhotos] = useState([])
  const [sharing, setSharing] = useState({ photoCID: '', recipientDID: '', permissions: ['view'], expirationDays: 30 })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState('')
  const [managingPhoto, setManagingPhoto] = useState(null)
  const [sharedUsers, setSharedUsers] = useState([])

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(''), 5000)
  }

  // Generate a DID for demo purposes
  const generateDID = async () => {
    setLoading(true)
    try {
      const response = await fetch('/generate-did', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setUserDID(result.did)
        showNotification('DID generated successfully!', 'success')
      } else {
        showNotification('Failed to generate DID: ' + result.error, 'error')
      }
    } catch (error) {
      showNotification('Failed to generate DID: ' + error.message, 'error')
    }
    setLoading(false)
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file || !userDID) return

    setLoading(true)
    const formData = new FormData()
    formData.append('photo', file)
    formData.append('ownerDID', userDID)

    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      if (result.success) {
        setPhotos(prev => [...prev, result])
        showNotification('Photo uploaded successfully!', 'success')
        e.target.value = '' // Reset file input
      } else {
        showNotification('Upload failed: ' + result.error, 'error')
      }
    } catch (error) {
      showNotification('Upload failed: ' + error.message, 'error')
    }
    setLoading(false)
  }

  const sharePhoto = async () => {
    if (!sharing.photoCID || !sharing.recipientDID) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/photos/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoCID: sharing.photoCID,
          ownerDID: userDID,
          recipientDID: sharing.recipientDID,
          permissions: sharing.permissions,
          expirationDays: sharing.expirationDays
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('Share result:', result)
        // Fix the share URL to use current domain
        const correctShareURL = result.shareURL.replace('http://localhost:5173', window.location.origin)
        const shareMessage = `Photo shared successfully!\n\nShare URL: ${correctShareURL}\n\nLink copied to clipboard.`
        alert(shareMessage)
        showNotification('Photo shared successfully! Link copied to clipboard.', 'success')
        navigator.clipboard.writeText(correctShareURL)
        setSharing({ photoCID: '', recipientDID: '', permissions: ['view'], expirationDays: 30 })
      } else {
        showNotification('Share failed: ' + result.error, 'error')
      }
    } catch (error) {
      showNotification('Share failed: ' + error.message, 'error')
    }
    setLoading(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showNotification('Copied to clipboard!', 'success')
  }

  const showSharedUsers = async (photoCID) => {
    const photo = photos.find(p => p.cid === photoCID)
    if (photo) {
      setManagingPhoto(photo)
      // Fetch actual shared users from server
      try {
        const response = await fetch(`/api/photos/shared/${photoCID}?ownerDID=${userDID}`)
        const result = await response.json()
        if (result.success) {
          setSharedUsers(result.sharedUsers || [])
        } else {
          setSharedUsers([])
        }
      } catch (error) {
        console.error('Failed to fetch shared users:', error)
        setSharedUsers([])
      }
    }
  }

  const revokeAccess = async (photoCID, recipientDID) => {
    setLoading(true)
    try {
      const response = await fetch('/api/photos/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoCID,
          ownerDID: userDID,
          recipientDID
        })
      })
      
      const result = await response.json()
      if (result.success) {
        showNotification('Access revoked successfully!', 'success')
        // Update local state
        setPhotos(prev => prev.map(photo => 
          photo.cid === photoCID 
            ? { ...photo, sharedWith: photo.sharedWith - 1 }
            : photo
        ))
        setSharedUsers(prev => prev.filter(user => user.recipientDID !== recipientDID))
      } else {
        showNotification('Revoke failed: ' + result.error, 'error')
      }
    } catch (error) {
      showNotification('Revoke failed: ' + error.message, 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow border-b-2 border-blue-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-black mb-2">
            🔐 Decentralized Photo Sharing
          </h1>
          <p className="text-gray-700">
            Secure photo sharing with UCANs and Storacha
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-black">Photos: {photos.length}</span>
            {userDID && (
              <span className="bg-green-200 text-green-900 px-3 py-1 rounded text-sm font-medium">
                ✓ Connected
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border-2 font-medium ${
            notification.type === 'success' ? 'bg-green-100 text-green-900 border-green-300' :
            notification.type === 'error' ? 'bg-red-100 text-red-900 border-red-300' :
            'bg-blue-100 text-blue-900 border-blue-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* User Identity */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border">
          <h2 className="text-xl font-bold text-black mb-4">Your Identity</h2>
          {!userDID ? (
            <div className="flex items-center justify-between">
              <p className="text-gray-800">Generate a decentralized identifier to get started</p>
              <button
                onClick={generateDID}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? '⏳ Generating...' : '🔑 Generate DID'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-black font-medium mb-2">Your DID:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-200 p-3 rounded-lg text-sm break-all flex-1 font-mono text-black">
                  {userDID}
                </code>
                <button
                  onClick={() => copyToClipboard(userDID)}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {userDID && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border">
            <h2 className="text-xl font-bold text-black mb-4">📸 Upload Photo</h2>
            <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
                disabled={loading}
                className="block w-full text-sm text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 disabled:opacity-50"
              />
              <p className="text-gray-700 text-sm mt-2">
                Select an image to upload to decentralized storage
              </p>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border">
            <h2 className="text-xl font-bold text-black mb-6">🖼️ Your Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div key={photo.cid} className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border">
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-black mb-1 truncate">{photo.filename}</h3>
                    <p className="text-xs text-gray-700 mb-1">
                      CID: {photo.cid.slice(0, 20)}...
                    </p>
                    <p className="text-xs text-gray-700 mb-1">
                      Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-700 mb-3">
                      Shared with: {photo.sharedWith} users
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSharing({ ...sharing, photoCID: photo.cid })}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        🔗 Share Photo
                      </button>
                      {photo.sharedWith > 0 && (
                        <button
                          onClick={() => showSharedUsers(photo.cid)}
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                        >
                          👥 Manage Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        {sharing.photoCID && (
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <h2 className="text-xl font-bold text-black mb-6">
              🤝 Share Photo
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Recipient DID
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={sharing.recipientDID}
                    onChange={(e) => setSharing({ ...sharing, recipientDID: e.target.value })}
                    placeholder="did:key:..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  <button
                    onClick={async () => {
                      const response = await fetch('/generate-did', { method: 'POST' })
                      const result = await response.json()
                      if (result.success) {
                        setSharing({ ...sharing, recipientDID: result.did })
                        showNotification('Test DID generated', 'success')
                      }
                    }}
                    className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 text-sm font-medium"
                  >
                    🎲 Generate Test DID
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-blue-50 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={sharing.permissions.includes('view')}
                      onChange={(e) => {
                        const perms = e.target.checked 
                          ? [...sharing.permissions.filter(p => p !== 'view'), 'view']
                          : sharing.permissions.filter(p => p !== 'view')
                        setSharing({ ...sharing, permissions: perms })
                      }}
                      className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 mr-3 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm text-black font-medium">👁️ View Permission</span>
                      <p className="text-xs text-gray-600">Allow viewing the photo in browser</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-green-50 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={sharing.permissions.includes('download')}
                      onChange={(e) => {
                        const perms = e.target.checked 
                          ? [...sharing.permissions.filter(p => p !== 'download'), 'download']
                          : sharing.permissions.filter(p => p !== 'download')
                        setSharing({ ...sharing, permissions: perms })
                      }}
                      className="rounded border-gray-400 text-green-600 focus:ring-green-500 mr-3 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm text-black font-medium">💾 Download Permission</span>
                      <p className="text-xs text-gray-600">Allow downloading the photo file</p>
                    </div>
                  </label>
                </div>
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Note:</strong> Recipients can only download if you grant download permission. 
                    View permission is required for any access.
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  ⏰ Expiration
                </label>
                <select
                  value={sharing.expirationDays || 30}
                  onChange={(e) => setSharing({ ...sharing, expirationDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>1 week</option>
                  <option value={30}>1 month (default)</option>
                  <option value={90}>3 months</option>
                  <option value={365}>1 year</option>
                </select>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={sharePhoto}
                  disabled={loading || !sharing.recipientDID || sharing.permissions.length === 0}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? '⏳ Creating...' : '🚀 Create Share Link'}
                </button>
                <button
                  onClick={() => setSharing({ photoCID: '', recipientDID: '', permissions: ['view'], expirationDays: 30 })}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Access Modal */}
        {managingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  👥 Manage Access - {managingPhoto.filename}
                </h2>
                <button
                  onClick={() => setManagingPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {sharedUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users have access to this photo</p>
              ) : (
                <div className="space-y-4">
                  {sharedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm break-all">
                          {user.recipientDID}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Permissions: {user.permissions.join(', ')} | 
                          Expires: {new Date(user.expiresAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Shared: {new Date(user.sharedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => revokeAccess(managingPhoto.cid, user.recipientDID)}
                        disabled={loading}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium ml-4"
                      >
                        🚫 Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-100 rounded-lg p-6 border-2 border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🔍 How it works</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-blue-900 mb-2">🔐 UCANs (User Controlled Authorization Networks)</h4>
              <p className="text-blue-800">Decentralized permissions without central servers. You control who can access your photos.</p>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">🌐 Storacha Storage</h4>
              <p className="text-blue-800">Photos stored on decentralized IPFS network with content-addressed identifiers (CIDs).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}