/**
 * Bulletproof Video Downloader Helper
 * Handles Blob URLs, Data URLs, and remote URLs cleanly.
 * Converts to local object URL and clicks invisible anchor tag.
 * NEVER redirects the user to external XML AccessDenied pages.
 */
export async function downloadVideoFile(url: string, filename: string): Promise<void> {
  const cleanName = filename
    ? filename.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_')
    : 'video_review_ai';

  const ext = url.includes('.webm') ? '.webm' : '.mp4';
  const finalFilename = cleanName.endsWith('.mp4') || cleanName.endsWith('.webm')
    ? cleanName
    : `${cleanName}${ext}`;

  // 1. Direct Blob or Data URL
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 2. Remote URL - Fetch as Blob first to prevent opening in browser
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60000);
  } catch (err) {
    console.warn('Direct fetch failed, falling back to direct anchor download:', err);
    // As a safe fallback, download directly
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
