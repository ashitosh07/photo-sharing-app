import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as raw from 'multiformats/codecs/raw'

/**
 * Simplified Storacha Client for Demo (Singleton)
 * 
 * For demo purposes, generates mock CIDs and stores photos in memory
 * In production, integrate with actual Storacha/Web3.Storage client
 */

class StorachaClient {
  constructor() {
    if (StorachaClient.instance) {
      return StorachaClient.instance
    }
    
    // Mock storage for demo - in production use actual Storacha
    this.mockStorage = new Map()
    
    StorachaClient.instance = this
  }

  /**
   * Upload a photo (mock implementation for demo)
   * @param {File|Buffer} photoFile - Photo file to upload
   * @param {string} filename - Original filename
   */
  async uploadPhoto(photoFile, filename) {
    try {
      // Generate a mock CID for demo purposes
      const photoBuffer = Buffer.from(photoFile)
      const hash = await sha256.digest(photoBuffer)
      const cid = CID.create(1, raw.code, hash)
      
      // Store in mock storage
      this.mockStorage.set(cid.toString(), {
        data: photoBuffer,
        filename,
        contentType: 'image/jpeg'
      })
      
      return {
        success: true,
        cid: cid.toString(),
        filename,
        uploadedAt: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get photo URL (mock implementation)
   * @param {string} cid - Content ID of the photo
   */
  getPhotoURL(cid) {
    // Return data URL for mock storage
    const stored = this.mockStorage.get(cid)
    if (stored) {
      const base64 = stored.data.toString('base64')
      return `data:${stored.contentType};base64,${base64}`
    }
    return null
  }

  /**
   * Download photo data (mock implementation)
   * @param {string} cid - Content ID of the photo
   */
  async downloadPhoto(cid) {
    try {
      const stored = this.mockStorage.get(cid)
      
      if (!stored) {
        throw new Error('Photo not found')
      }
      
      return {
        success: true,
        data: stored.data,
        contentType: stored.contentType
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default StorachaClient