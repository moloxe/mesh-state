export type MeshMessage =
  | { type: 'register'; payload: string }
  | { type: 'peers'; payload: string[] }
  | { type: 'peer-joined'; payload: string }
  | { type: 'peer-left'; payload: string }
