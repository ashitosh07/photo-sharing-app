/**
 * Simplified UCAN Service for Photo Sharing Demo
 * 
 * This is a simplified implementation that demonstrates UCAN concepts
 * without complex cryptographic operations for demo purposes.
 * 
 * In production, use full UCAN libraries with proper cryptographic signatures.
 */

class UCANService {
  constructor() {
    // Simplified service identity for demo
    this.serviceDID = 'did:key:demo-service-' + Math.random().toString(36).substr(2, 9)
    
    // Active delegations store (in production: use persistent storage)
    this.activeDelegations = new Map()
  }

  /**
   * Create a UCAN delegation for photo access
   * @param {string} photoCID - Content ID of the photo
   * @param {string} audienceDID - DID of user receiving permission
   * @param {Array} capabilities - ['view', 'download']
   * @param {number} expirationDays - Days until expiration
   */
  async createDelegation(photoCID, audienceDID, capabilities = ['view'], expirationDays = 30) {
    const expiration = Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60)
    
    // Create delegation proof (simplified for demo)
    const delegationId = `${photoCID}-${audienceDID}`
    const proofData = {
      photoCID,
      audienceDID,
      capabilities,
      expiration,
      issuer: this.serviceDID,
      created: Date.now()
    }
    
    const mockProof = Buffer.from(JSON.stringify(proofData))

    // Store delegation for revocation tracking
    this.activeDelegations.set(delegationId, {
      photoCID,
      audienceDID,
      capabilities,
      expiration,
      revoked: false
    })

    return {
      delegation: delegationId,
      proof: mockProof,
      expiresAt: new Date(expiration * 1000).toISOString()
    }
  }

  /**
   * Verify a UCAN delegation for photo access
   * @param {Uint8Array} proofBytes - Encoded UCAN proof
   * @param {string} photoCID - Photo being accessed
   * @param {string} capability - Required capability (view/download)
   */
  async verifyAccess(proofBytes, photoCID, capability) {
    try {
      // Decode proof
      const proofData = JSON.parse(proofBytes.toString())
      
      // Check if delegation exists and is not revoked
      const delegationKey = `${photoCID}-${proofData.audienceDID}`
      const stored = this.activeDelegations.get(delegationKey)
      
      if (!stored) {
        return { valid: false, reason: 'Delegation not found' }
      }
      
      if (stored.revoked) {
        return { valid: false, reason: 'Delegation revoked' }
      }
      
      // Check expiration
      if (Date.now() / 1000 > stored.expiration) {
        return { valid: false, reason: 'Delegation expired' }
      }
      
      // Check capability
      if (!stored.capabilities.includes(capability)) {
        return { valid: false, reason: 'Capability not granted' }
      }

      return {
        valid: true,
        audience: proofData.audienceDID
      }
    } catch (error) {
      return { valid: false, reason: error.message }
    }
  }

  /**
   * Revoke access to a photo for specific user
   * @param {string} photoCID - Photo CID
   * @param {string} audienceDID - User DID to revoke
   */
  revokeAccess(photoCID, audienceDID) {
    const delegationId = `${photoCID}-${audienceDID}`
    const delegation = this.activeDelegations.get(delegationId)
    
    if (delegation) {
      delegation.revoked = true
      this.activeDelegations.set(delegationId, delegation)
      return { success: true, message: 'Access revoked' }
    }
    
    return { success: false, message: 'Delegation not found' }
  }

  /**
   * List active delegations for a photo
   * @param {string} photoCID - Photo CID
   */
  listDelegations(photoCID) {
    const delegations = []
    
    for (const [key, delegation] of this.activeDelegations.entries()) {
      if (delegation.photoCID === photoCID && !delegation.revoked) {
        delegations.push({
          audienceDID: delegation.audienceDID,
          capabilities: delegation.capabilities,
          expiresAt: new Date(delegation.expiration * 1000).toISOString()
        })
      }
    }
    
    return delegations
  }
}

export default UCANService