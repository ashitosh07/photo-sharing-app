import UCANService from './ucan-service.js'
import StorachaClient from './storacha-client.js'

/**
 * Photo Service - Main orchestrator (Singleton)
 * 
 * Combines Storacha storage with UCAN authorization
 * to create a complete decentralized photo sharing system
 */

class PhotoService {
  constructor() {
    if (PhotoService.instance) {
      return PhotoService.instance
    }
    
    this.ucanService = new UCANService()
    this.storachaClient = new StorachaClient()
    
    // Photo metadata store (in production: use persistent storage)
    this.photos = new Map()
    
    PhotoService.instance = this
  }

  /**
   * Upload a photo and create initial metadata
   * @param {File|Buffer} photoFile - Photo file
   * @param {string} filename - Original filename
   * @param {string} ownerDID - DID of photo owner
   */
  async uploadPhoto(photoFile, filename, ownerDID) {
    // Upload to Storacha
    const uploadResult = await this.storachaClient.uploadPhoto(photoFile, filename)
    
    if (!uploadResult.success) {
      return uploadResult
    }

    // Store photo metadata
    const photoData = {
      cid: uploadResult.cid,
      filename,
      ownerDID,
      uploadedAt: uploadResult.uploadedAt,
      sharedWith: []
    }
    
    this.photos.set(uploadResult.cid, photoData)

    return {
      success: true,
      cid: uploadResult.cid,
      url: this.storachaClient.getPhotoURL(uploadResult.cid),
      ...photoData
    }
  }

  /**
   * Share a photo with another user using UCAN delegation
   * @param {string} photoCID - Photo CID
   * @param {string} ownerDID - Photo owner DID
   * @param {string} recipientDID - Recipient DID
   * @param {Array} permissions - ['view', 'download']
   * @param {number} expirationDays - Days until expiration
   */
  async sharePhoto(photoCID, ownerDID, recipientDID, permissions = ['view'], expirationDays = 30) {
    const photo = this.photos.get(photoCID)
    
    if (!photo) {
      return { success: false, error: 'Photo not found' }
    }
    
    if (photo.ownerDID !== ownerDID) {
      return { success: false, error: 'Not authorized to share this photo' }
    }

    // Create UCAN delegation
    const delegation = await this.ucanService.createDelegation(
      photoCID,
      recipientDID,
      permissions,
      expirationDays
    )

    // Update photo metadata
    photo.sharedWith.push({
      recipientDID,
      permissions,
      sharedAt: new Date().toISOString(),
      expiresAt: delegation.expiresAt
    })
    
    this.photos.set(photoCID, photo)

    return {
      success: true,
      delegation: delegation.delegation,
      proof: delegation.proof,
      expiresAt: delegation.expiresAt,
      shareURL: `${this.getBaseURL()}/photo/${photoCID}?proof=${Buffer.from(delegation.proof).toString('base64')}`
    }
  }

  /**
   * Access a photo using UCAN proof
   * @param {string} photoCID - Photo CID
   * @param {string} proofBase64 - Base64 encoded UCAN proof
   * @param {string} action - 'view' or 'download'
   */
  async accessPhoto(photoCID, proofBase64, action = 'view') {
    const photo = this.photos.get(photoCID)
    
    if (!photo) {
      return { success: false, error: 'Photo not found' }
    }

    // Decode proof and verify access
    const proofBytes = Buffer.from(proofBase64, 'base64')
    const verification = await this.ucanService.verifyAccess(proofBytes, photoCID, action)

    if (!verification.valid) {
      return { success: false, error: verification.reason }
    }

    // Return photo access based on action
    if (action === 'view') {
      return {
        success: true,
        url: this.storachaClient.getPhotoURL(photoCID),
        filename: photo.filename,
        metadata: {
          uploadedAt: photo.uploadedAt,
          sharedBy: photo.ownerDID
        }
      }
    }

    if (action === 'download') {
      const downloadResult = await this.storachaClient.downloadPhoto(photoCID)
      return {
        success: downloadResult.success,
        data: downloadResult.data,
        contentType: downloadResult.contentType,
        filename: photo.filename,
        error: downloadResult.error
      }
    }

    return { success: false, error: 'Invalid action' }
  }

  /**
   * Revoke access to a photo
   * @param {string} photoCID - Photo CID
   * @param {string} ownerDID - Photo owner DID
   * @param {string} recipientDID - Recipient DID to revoke
   */
  revokeAccess(photoCID, ownerDID, recipientDID) {
    const photo = this.photos.get(photoCID)
    
    if (!photo || photo.ownerDID !== ownerDID) {
      return { success: false, error: 'Not authorized' }
    }

    // Revoke UCAN delegation
    const result = this.ucanService.revokeAccess(photoCID, recipientDID)
    
    if (result.success) {
      // Update photo metadata
      photo.sharedWith = photo.sharedWith.filter(share => share.recipientDID !== recipientDID)
      this.photos.set(photoCID, photo)
    }

    return result
  }

  /**
   * Get the correct base URL for the current environment
   */
  getBaseURL() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    
    // Server-side: check for Vercel environment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    // Fallback to localhost for development
    return 'http://localhost:5173'
  }

  /**
   * List photos owned by a user
   * @param {string} ownerDID - Owner DID
   */
  listPhotos(ownerDID) {
    const userPhotos = []
    
    for (const [cid, photo] of this.photos.entries()) {
      if (photo.ownerDID === ownerDID) {
        userPhotos.push({
          cid,
          filename: photo.filename,
          uploadedAt: photo.uploadedAt,
          url: this.storachaClient.getPhotoURL(cid),
          sharedWith: photo.sharedWith.length,
          delegations: this.ucanService.listDelegations(cid)
        })
      }
    }
    
    return userPhotos
  }
}

export default PhotoService