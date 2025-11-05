/**
 * Example Usage of the Decentralized Photo Sharing System
 * 
 * This demonstrates the complete flow of uploading, sharing, and accessing photos
 * using UCANs and Storacha in a decentralized manner.
 */

import PhotoService from './lib/photo-service.js'
import { ed25519 } from '@ucanto/principal'
import { readFileSync } from 'fs'

async function demonstratePhotoSharing() {
  console.log('🚀 Starting Decentralized Photo Sharing Demo\n')
  
  const photoService = new PhotoService()
  
  // 1. Create user identities (DIDs)
  console.log('1. Creating user identities...')
  const alice = ed25519.generate() // Photo owner
  const bob = ed25519.generate()   // Photo recipient
  
  console.log(`   Alice DID: ${alice.did()}`)
  console.log(`   Bob DID: ${bob.did()}\n`)
  
  // 2. Alice uploads a photo to Storacha
  console.log('2. Alice uploads a photo...')
  const photoFile = readFileSync('./example-photo.jpg') // Replace with actual photo
  const uploadResult = await photoService.uploadPhoto(
    photoFile,
    'vacation-sunset.jpg',
    alice.did()
  )
  
  if (uploadResult.success) {
    console.log(`   ✅ Photo uploaded successfully!`)
    console.log(`   📷 CID: ${uploadResult.cid}`)
    console.log(`   🔗 URL: ${uploadResult.url}\n`)
  } else {
    console.log(`   ❌ Upload failed: ${uploadResult.error}`)
    return
  }
  
  // 3. Alice shares the photo with Bob using UCAN delegation
  console.log('3. Alice shares photo with Bob...')
  const shareResult = await photoService.sharePhoto(
    uploadResult.cid,
    alice.did(),
    bob.did(),
    ['view', 'download'], // Bob can view and download
    30 // Expires in 30 days
  )
  
  if (shareResult.success) {
    console.log(`   ✅ Photo shared successfully!`)
    console.log(`   🎫 UCAN Delegation ID: ${shareResult.delegation}`)
    console.log(`   🔗 Share URL: ${shareResult.shareURL}`)
    console.log(`   ⏰ Expires: ${shareResult.expiresAt}\n`)
  } else {
    console.log(`   ❌ Share failed: ${shareResult.error}`)
    return
  }
  
  // 4. Bob accesses the photo using the UCAN proof
  console.log('4. Bob accesses the shared photo...')
  const proofBase64 = Buffer.from(shareResult.proof).toString('base64')
  
  // Bob views the photo
  const viewResult = await photoService.accessPhoto(
    uploadResult.cid,
    proofBase64,
    'view'
  )
  
  if (viewResult.success) {
    console.log(`   ✅ Bob can view the photo!`)
    console.log(`   📷 Photo URL: ${viewResult.url}`)
    console.log(`   📝 Filename: ${viewResult.filename}`)
    console.log(`   👤 Shared by: ${viewResult.metadata.sharedBy}\n`)
  } else {
    console.log(`   ❌ View access denied: ${viewResult.error}`)
  }
  
  // Bob downloads the photo
  const downloadResult = await photoService.accessPhoto(
    uploadResult.cid,
    proofBase64,
    'download'
  )
  
  if (downloadResult.success) {
    console.log(`   ✅ Bob can download the photo!`)
    console.log(`   📦 File size: ${downloadResult.data.byteLength} bytes`)
    console.log(`   🎭 Content type: ${downloadResult.contentType}\n`)
  } else {
    console.log(`   ❌ Download access denied: ${downloadResult.error}`)
  }
  
  // 5. Alice revokes Bob's access
  console.log('5. Alice revokes Bob\\'s access...')
  const revokeResult = photoService.revokeAccess(
    uploadResult.cid,
    alice.did(),
    bob.did()
  )
  
  if (revokeResult.success) {
    console.log(`   ✅ Access revoked successfully!`)
    console.log(`   📝 ${revokeResult.message}\n`)
  } else {
    console.log(`   ❌ Revocation failed: ${revokeResult.message}`)
  }
  
  // 6. Bob tries to access the photo again (should fail)
  console.log('6. Bob tries to access photo after revocation...')
  const blockedResult = await photoService.accessPhoto(
    uploadResult.cid,
    proofBase64,
    'view'
  )
  
  if (!blockedResult.success) {
    console.log(`   ✅ Access correctly denied: ${blockedResult.error}`)
    console.log(`   🔒 Revocation working as expected!\n`)
  } else {
    console.log(`   ❌ Unexpected: Access should have been denied`)
  }
  
  // 7. List Alice's photos and their delegations
  console.log('7. Alice\\'s photo library...')
  const alicePhotos = photoService.listPhotos(alice.did())
  
  alicePhotos.forEach((photo, index) => {
    console.log(`   Photo ${index + 1}:`)
    console.log(`     📷 ${photo.filename}`)
    console.log(`     🆔 CID: ${photo.cid}`)
    console.log(`     📅 Uploaded: ${new Date(photo.uploadedAt).toLocaleDateString()}`)
    console.log(`     👥 Shared with: ${photo.sharedWith} users`)
    console.log(`     🎫 Active delegations: ${photo.delegations.length}`)
    
    photo.delegations.forEach((delegation, i) => {
      console.log(`       ${i + 1}. ${delegation.audienceDID}`)
      console.log(`          Permissions: ${delegation.capabilities.join(', ')}`)
      console.log(`          Expires: ${new Date(delegation.expiresAt).toLocaleDateString()}`)
    })
    console.log('')
  })
  
  console.log('🎉 Demo completed! This shows how UCANs enable:')
  console.log('   • Decentralized authorization without servers')
  console.log('   • Fine-grained permissions (view vs download)')
  console.log('   • Time-based expiration')
  console.log('   • Instant revocation')
  console.log('   • User-controlled sharing')
}

// Run the demo
demonstratePhotoSharing().catch(console.error)