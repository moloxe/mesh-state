import { Elysia, t } from 'elysia'
import { type MeshMessage } from '../types/mesh'

// Store active peers (PeerJS ID -> WebSocket)
// We mostly just need the set of IDs for the 'peers' list.
const activePeers = new Set<string>()

class Peer {
  constructor(public id: string) {}
}

const TOPIC = 'mesh'

const app = new Elysia()
  .derive(() => ({
    peer: new Peer(''),
  }))
  .get('/', () => ({ peers: Array.from(activePeers) }))
  .ws('/ws', {
    body: t.Object({
      type: t.String(),
      payload: t.Any(),
    }),
    open(ws) {
      ws.subscribe(TOPIC)
    },
    message(ws, message) {
      if (message.type === 'register') {
        const peerId = message.payload
        ws.data.peer.id = peerId

        const peers = Array.from(activePeers).filter((id) => id !== peerId)
        ws.send({ type: 'peers', payload: peers } as MeshMessage)

        activePeers.add(peerId)
        ws.publish(TOPIC, {
          type: 'peer-joined',
          payload: peerId,
        } as MeshMessage)

        console.log(`Peer joined: ${peerId}. Total: ${activePeers.size}`)
      }
    },
    close(ws) {
      const peerId = ws.data.peer.id as string | undefined
      if (peerId && activePeers.has(peerId)) {
        activePeers.delete(peerId)
        ws.publish(TOPIC, {
          type: 'peer-left',
          payload: peerId,
        } as MeshMessage)
        console.log(`Peer left: ${peerId}. Total: ${activePeers.size}`)
      }
    },
  })
  .listen(3000)

console.log(
  `Signaling server running at http://${app.server?.hostname}:${app.server?.port}`
)
