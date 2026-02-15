import Peer, { type DataConnection } from 'peerjs'
import type { MeshMessage, MeshState } from '../types/mesh'

export class MeshClient {
  #peers: Record<string, DataConnection> = {}
  #globalState: { [key: string]: MeshState } = {}
  #myId: string | null = null
  #ws: WebSocket | null = null
  #peer: Peer | null = null
  #wsUrl: string
  onReady: ((id: string) => void) | null = null
  onPeersChange: ((peers: string[]) => void) | null = null
  onStateChange: ((state: MeshState) => void) | null = null

  constructor(wsUrl: string) {
    this.#wsUrl = wsUrl
    this.#init()
  }

  async #init() {
    this.#peer = new Peer()

    this.#peer.on('open', (id) => {
      const isFirstConnection = !this.#myId
      this.#myId = id
      if (isFirstConnection) this.onReady?.(id)
      this.#connectSignaling(id)
    })

    this.#peer.on('connection', (conn) => {
      this.#setupConnection(conn, conn.peer)
    })

    this.#peer.on('error', (err) => console.error('PeerJS Error:', err))
  }

  #connectSignaling(id: string) {
    this.#ws = new WebSocket(this.#wsUrl)

    this.#ws.onopen = () => {
      const msg: MeshMessage = { type: 'register', payload: id }
      this.#ws?.send(JSON.stringify(msg))
    }

    this.#ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as MeshMessage
        this.#handleSignal(msg)
      } catch (e) {
        console.error('Failed to parse signal:', e)
      }
    }
  }

  #handleSignal(msg: MeshMessage) {
    switch (msg.type) {
      case 'peers':
        msg.payload.forEach((remoteId) => this.#connectToPeer(remoteId))
        break
      case 'peer-left':
        this.#cleanupPeer(msg.payload)
        break
    }
  }

  #connectToPeer(remoteId: string) {
    if (this.#peers[remoteId] || remoteId === this.#myId) return

    const conn = this.#peer?.connect(remoteId)
    if (conn) {
      this.#setupConnection(conn, remoteId)
    }
  }

  #setupConnection(conn: DataConnection, remoteId: string) {
    this.#peers[remoteId] = conn
    this.onPeersChange?.(Object.keys(this.#peers))

    conn.on('open', () => {
      if (!this.#myId || Object.keys(this.#globalState).length === 0) return
      conn.send(this.#globalState[this.#myId])
    })

    conn.on('data', (data: unknown) => {
      this.#mergeState(remoteId, data as MeshState)
    })

    conn.on('close', () => {
      this.#cleanupPeer(remoteId)
    })

    conn.on('error', (err) => {
      this.#cleanupPeer(remoteId)
    })
  }

  #cleanupPeer(remoteId: string) {
    if (this.#peers[remoteId]) {
      this.#peers[remoteId].close()
      delete this.#peers[remoteId]
      this.onPeersChange?.(Object.keys(this.#peers))
    }
  }

  updateState(myNewState: MeshState) {
    if (!this.#myId) return

    this.#mergeState(this.#myId, myNewState)

    Object.values(this.#peers).forEach((conn) => {
      if (conn.open) {
        conn.send(myNewState)
      }
    })
  }

  #mergeState(senderId: string, fragment: MeshState) {
    this.#globalState[senderId] = fragment
    this.onStateChange?.(this.#globalState)
  }

  destroy() {
    this.#ws?.close()
    this.#peer?.destroy()
  }
}
