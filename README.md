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

# Deploy on GCP/CE

1. `curl -fsSL https://bun.sh/install | bash`
2. `source ~/.bashrc`
3. `git clone https://github.com/moloxe/mesh-state`
4. `cd mesh-state`
5. `bun install`
6. `sudo PORT=80 nohup /home/francomolocheg99/.bun/bin/bun index.ts > /dev/null 2>&1 &`

Check: `sudo ss -ltn | grep :80`
