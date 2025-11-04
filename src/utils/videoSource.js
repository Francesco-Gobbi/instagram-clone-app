import { Platform } from 'react-native';

const normalizeExtension = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/[^a-z0-9]/g, '');

  if (!sanitized) {
    return null;
  }

  return sanitized.slice(0, 6);
};

const deriveFromMimeType = (mimeType) => {
  if (typeof mimeType !== 'string') {
    return null;
  }

  const lowerMime = mimeType.trim().toLowerCase();
  if (!lowerMime) {
    return null;
  }

  const directMap = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'video/webm': 'webm',
    'video/3gpp': '3gp',
  };

  if (directMap[lowerMime]) {
    return directMap[lowerMime];
  }

  const subtype = lowerMime.split('/')[1] || '';
  if (!subtype) {
    return null;
  }

  if (subtype === 'quicktime') {
    return 'mov';
  }

  if (subtype.includes('+')) {
    return normalizeExtension(subtype.split('+')[0]);
  }

  if (subtype.includes(';')) {
    return normalizeExtension(subtype.split(';')[0]);
  }

  return normalizeExtension(subtype);
};

const deriveFromUri = (uri) => {
  if (typeof uri !== 'string') {
    return null;
  }

  const cleaned = uri.split('?')[0].split('#')[0];
  const lastSegment = cleaned.split('/').pop() || '';

  if (!lastSegment.includes('.')) {
    return null;
  }

  const extension = lastSegment.split('.').pop();
  return normalizeExtension(extension);
};

export const createExpoVideoSource = (uri, mimeType) => {
  if (!uri) {
    return null;
  }

  // Normalize uri: strip query and fragment parts which can break native players
  const normalizedUri = typeof uri === 'string' ? uri.split('?')[0].split('#')[0] : uri;
  const source = { uri: normalizedUri };

  if (Platform.OS === 'android') {
    const extension = deriveFromMimeType(mimeType) || deriveFromUri(uri);

    if (extension) {
      source.overrideFileExtensionAndroid = extension;
    }
  }

  return source;
};

