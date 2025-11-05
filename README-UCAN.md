# Decentralized Photo Sharing with UCANs and Storacha

This app demonstrates a minimal implementation of decentralized photo sharing using:
- **UCANs** (User Controlled Authorization Networks) for permission delegation
- **Storacha** for decentralized photo storage

## How UCANs Work

UCANs enable decentralized authorization without centralized servers:

1. **Identity**: Each user has a cryptographic identity (DID - Decentralized Identifier)
2. **Capabilities**: Permissions are expressed as capabilities (e.g., "view photo X")
3. **Delegation**: Photo owners create signed tokens delegating specific capabilities
4. **Verification**: Recipients present UCAN tokens as proof of authorization

## Delegation Model

```
Photo Owner (Alice)
    ↓ Creates UCAN delegation
    ↓ Capability: "photo/view" + "photo/download"
    ↓ Audience: Bob's DID
    ↓ Expiration: 30 days
    ↓
Recipient (Bob)
    ↓ Presents UCAN proof
    ↓ Service verifies signature & constraints
    ↓
Access Granted ✓
```

## Key Features

- **Upload**: Photos stored on Storacha (IPFS-based decentralized storage)
- **Share**: Generate UCAN delegations with specific permissions
- **Access Control**: View/download permissions with expiration
- **Revocation**: Owners can revoke access anytime
- **Decentralized**: No central authority controls access

## Architecture

```
Frontend (React)
    ↓ Upload photos
    ↓ Create share links
lib/photo-service.js
    ↓ Orchestrates UCAN + Storacha
lib/ucan-service.js          lib/storacha-client.js
    ↓ Delegation logic           ↓ Storage operations
    ↓ Verification               ↓ Upload/download
    ↓ Revocation                 ↓ CID management
```

## Usage

1. **Generate Identity**: Click "Generate DID" to create your decentralized identity
2. **Upload Photo**: Select and upload a photo to Storacha
3. **Share Photo**: Enter recipient's DID and select permissions (view/download)
4. **Access Photo**: Recipients use the share URL with embedded UCAN proof

## UCAN Benefits

- **User Control**: Users control their own permissions
- **No Central Authority**: No OAuth servers or permission databases
- **Cryptographic Security**: Unforgeable signatures
- **Fine-grained**: Specific capabilities with expiration
- **Revocable**: Owners maintain control

## Production Considerations

- Store service keys securely (not in memory)
- Use persistent storage for delegations
- Implement proper key management
- Add rate limiting and abuse prevention
- Configure Storacha with your own service endpoint
- Add proper error handling and logging

## Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to use the app.