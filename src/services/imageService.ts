import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface ImageKitAuthParams {
  signature: string;
  expire: string | number;
  token: string;
  publicKey?: string;
}

export interface ImageKitUploadOptions {
  fileName?: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
}

export interface ImageKitImage {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  filePath?: string;
  height?: number;
  width?: number;
  size?: number;
}

interface ImageKitConfig {
  publicKey: string;
  urlEndpoint: string;
  authEndpoint: string;
}

const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const DEFAULT_FOLDER = '/fitness-app/workouts';

function readExtra(name: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;
  return extra?.[name];
}

export function getImageKitConfig(): ImageKitConfig {
  return {
    publicKey: readExtra('imageKitPublicKey') ?? '',
    urlEndpoint: (readExtra('imageKitUrlEndpoint') ?? '').replace(/\/$/, ''),
    authEndpoint: readExtra('imageKitAuthEndpoint') ?? '',
  };
}

export function isImageKitConfigured() {
  const config = getImageKitConfig();
  return Boolean(config.publicKey && config.urlEndpoint && config.authEndpoint);
}

function assertConfigured(config: ImageKitConfig) {
  const missing = [
    !config.publicKey && 'EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY',
    !config.urlEndpoint && 'EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT',
    !config.authEndpoint && 'EXPO_PUBLIC_IMAGEKIT_AUTH_ENDPOINT',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`ImageKit is not configured. Missing: ${missing.join(', ')}`);
  }
}

async function getAuthParams(config: ImageKitConfig): Promise<ImageKitAuthParams> {
  const response = await fetch(config.authEndpoint);

  if (!response.ok) {
    throw new Error(`ImageKit auth failed: ${response.status}`);
  }

  const data = (await response.json()) as ImageKitAuthParams;

  if (!data.signature || !data.expire || !data.token) {
    throw new Error('ImageKit auth response must contain signature, expire and token.');
  }

  return data;
}

function guessFileName(uri: string, provided?: string) {
  if (provided?.trim()) return provided.trim();

  const cleanUri = uri.split('?')[0];
  const lastSegment = cleanUri.split('/').filter(Boolean).pop();
  return lastSegment?.includes('.') ? lastSegment : `workout-${Date.now()}.jpg`;
}

function guessMimeType(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';

  return 'image/jpeg';
}

function appendFile(formData: FormData, uri: string, fileName: string) {
  if (Platform.OS === 'web') {
    formData.append('file', uri);
    return;
  }

  formData.append('file', {
    uri,
    name: fileName,
    type: guessMimeType(fileName),
  } as unknown as Blob);
}

export async function uploadImageToImageKit(uri: string, options: ImageKitUploadOptions = {}): Promise<ImageKitImage> {
  const config = getImageKitConfig();
  assertConfigured(config);

  const auth = await getAuthParams(config);
  const fileName = guessFileName(uri, options.fileName);
  const formData = new FormData();

  appendFile(formData, uri, fileName);
  formData.append('fileName', fileName);
  formData.append('publicKey', auth.publicKey ?? config.publicKey);
  formData.append('signature', auth.signature);
  formData.append('expire', String(auth.expire));
  formData.append('token', auth.token);
  formData.append('folder', options.folder ?? DEFAULT_FOLDER);
  formData.append('useUniqueFileName', String(options.useUniqueFileName ?? true));

  if (options.tags?.length) {
    formData.append('tags', options.tags.join(','));
  }

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message ?? payload?.error?.message ?? `ImageKit upload failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as ImageKitImage;
}

export function getImageKitImageUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const { urlEndpoint } = getImageKitConfig();
  if (!urlEndpoint) return pathOrUrl;

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${urlEndpoint}${path}`;
}
