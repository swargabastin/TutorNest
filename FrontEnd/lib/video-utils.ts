/**
 * Utility functions for validating and safely embedding tutor introduction videos.
 * Supports YouTube, Vimeo, and Cloudinary.
 */

export interface ParsedVideo {
  provider: 'youtube' | 'vimeo' | 'cloudinary' | 'unknown';
  videoId?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  isValid: boolean;
}

export function parseVideoUrl(url?: string | null): ParsedVideo {
  if (!url || typeof url !== 'string') {
    return { provider: 'unknown', isValid: false };
  }

  const trimmed = url.trim();

  // 1. YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
    };
  }

  // 2. Vimeo
  // Matches: vimeo.com/ID
  const vimeoMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1`,
      thumbnailUrl: undefined,
      isValid: true,
    };
  }

  // 3. Cloudinary Video
  if (/^https?:\/\/res\.cloudinary\.com\/.+\/video\/upload\/.+/i.test(trimmed)) {
    return {
      provider: 'cloudinary',
      embedUrl: trimmed,
      thumbnailUrl: trimmed.replace(/\/video\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/, '/video/upload/$1.jpg'),
      isValid: true,
    };
  }

  return { provider: 'unknown', isValid: false };
}
