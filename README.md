# Mesh State Sync

Real-time JSON state synchronization using Full Mesh WebRTC (PeerJS) & ElysiaJS Signaling.

## Structure

- `server/`: ElysiaJS Signaling Server (Presence & Discovery).
- `client/`: PeerJS Client (WebRTC Data Channels & State Sync).

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    bun install --production
    ```

2.  **Start Server**:
    ```bash
    bun run start
    ```

3.  **Run Client**: Use `src/client/MeshClient.ts` in your client project.

## Features

- **Signaling**: Elysia Native WebSockets.
- **WebRTC**: Managed via PeerJS (utilizing public PeerServer for SDP exchange).
- **Topology**: Full Mesh (Clients automatically connect to all peers provided by Elysia).
- **State**: Simple JSON merge and broadcast.

## Peer Dependencies

- `peerjs` (client-only)
