export default function TestShare() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">🧪 Test Share Links</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-bold text-black mb-4">How to Test the App:</h2>
          
          <div className="space-y-4 text-black">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold">1. Generate Your Identity</h3>
              <p>Click "Generate DID" to create your decentralized identifier</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold">2. Upload a Photo</h3>
              <p>Select an image file to upload to mock Storacha storage</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold">3. Share the Photo</h3>
              <p>Click "Share Photo" → "Generate Test DID" → Select permissions → "Create Share Link"</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-bold">4. Test the Share Link</h3>
              <p>Copy the share URL from the alert popup and open it in a new tab</p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold">5. Manage Access</h3>
              <p>Use "Manage Access" to see shared users and revoke permissions</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-bold text-blue-900 mb-2">Expected Behavior:</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Share links should show an alert with the full URL</li>
              <li>• URLs look like: /photo/[CID]?proof=[base64-encoded-proof]</li>
              <li>• Opening share links should show the photo if permissions allow</li>
              <li>• Revoked access should prevent photo viewing</li>
              <li>• Expired links should be rejected</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium inline-block"
          >
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  )
}