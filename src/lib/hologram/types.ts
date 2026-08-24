
export type AvatarProvider = 'ready-player-me' | 'meshy' | 'avatar-sdk' | 'placeholder';

export interface AvatarGenerationResult {
  avatarId: string;
  modelUrl: string;
  modelFormat: 'glb' | 'gltf';
  sourceProvider: AvatarProvider;
  createdAt: string;
  thumbnailUrl?: string;
}

export type GenerationStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
