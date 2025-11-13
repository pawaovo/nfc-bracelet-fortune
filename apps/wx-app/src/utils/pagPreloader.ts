/**
 * PAG 预加载 & 缓存工具（兼容小程序 / H5）
 */

const PAG_FILE_URL = 'https://720dcf1a.cpolar.io/pag/loading-fortune.pag';
const CACHE_KEY = 'loading-fortune.pag';
const WEB_STORAGE_KEY = 'pag-cache/loading-fortune';
const DOWNLOAD_TIMEOUT = 120000;

const globalAny = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
const wxApi = globalAny.wx;
const isMiniProgram = !!wxApi?.getFileSystemManager;

let webPagBuffer: ArrayBuffer | null = null;

function getMiniCachePath(): string {
  if (!isMiniProgram) {
    throw new Error('MiniProgram FS unavailable');
  }
  return `${wxApi.env.USER_DATA_PATH}/${CACHE_KEY}`;
}

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('LocalStorage unavailable:', error);
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function saveWebPagBuffer(buffer: ArrayBuffer) {
  webPagBuffer = buffer;
  const storage = getWebStorage();
  if (!storage) return;
  try {
    storage.setItem(WEB_STORAGE_KEY, arrayBufferToBase64(buffer));
  } catch (error) {
    console.warn('Failed to persist PAG buffer:', error);
  }
}

export async function isPagCached(): Promise<boolean> {
  if (isMiniProgram) {
    try {
      const fs = wxApi.getFileSystemManager();
      const filePath = getMiniCachePath();
      return new Promise(resolve => {
        fs.access({
          path: filePath,
          success: () => resolve(true),
          fail: () => resolve(false),
        });
      });
    } catch (error) {
      console.error('检查PAG缓存失败:', error);
      return false;
    }
  }

  if (webPagBuffer) return true;
  const storage = getWebStorage();
  if (!storage) return false;
  return !!storage.getItem(WEB_STORAGE_KEY);
}

export async function preloadPagFile(): Promise<boolean> {
  if (await isPagCached()) {
    console.log('PAG文件已缓存，无需重复下载');
    return true;
  }

  if (isMiniProgram) {
    return new Promise(resolve => {
      wxApi.downloadFile({
        url: PAG_FILE_URL,
        timeout: DOWNLOAD_TIMEOUT,
        success: res => {
          if (res.statusCode === 200) {
            const fs = wxApi.getFileSystemManager();
            const cachePath = getMiniCachePath();
            try {
              fs.saveFileSync(res.tempFilePath, cachePath);
              console.log('PAG文件预下载成功，已保存到:', cachePath);
              resolve(true);
            } catch (error) {
              console.error('PAG文件保存失败:', error);
              resolve(false);
            }
          } else {
            console.error('PAG文件下载失败，状态码:', res.statusCode);
            resolve(false);
          }
        },
        fail: error => {
          console.error('PAG文件下载失败:', error);
          resolve(false);
        },
      });
    });
  }

  const buffer = await downloadPagFileWithProgress();
  return !!buffer;
}

export async function downloadPagFileWithProgress(
  onProgress?: (progress: number) => void,
): Promise<ArrayBuffer | null> {
  if (isMiniProgram) {
    try {
      return await new Promise(resolve => {
        const downloadTask = wxApi.downloadFile({
          url: PAG_FILE_URL,
          timeout: DOWNLOAD_TIMEOUT,
          success: res => {
            if (res.statusCode === 200) {
              const fs = wxApi.getFileSystemManager();
              try {
                const buffer = fs.readFileSync(res.tempFilePath);
                const cachePath = getMiniCachePath();
                fs.saveFileSync(res.tempFilePath, cachePath);
                console.log('PAG文件下载成功，已缓存');
                resolve(buffer as ArrayBuffer);
              } catch (error) {
                console.error('读取PAG文件失败:', error);
                resolve(null);
              }
            } else {
              console.error('PAG文件下载失败，状态码:', res.statusCode);
              resolve(null);
            }
          },
          fail: error => {
            console.error('PAG文件下载失败:', error);
            resolve(null);
          },
        });

        if (onProgress) {
          downloadTask.onProgressUpdate(res => {
            onProgress(res.progress);
          });
        }
      });
    } catch (error) {
      console.error('下载PAG文件失败:', error);
      return null;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);
    const response = await fetch(PAG_FILE_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error('PAG文件下载失败，状态码:', response.status);
      return null;
    }

    const total = Number(response.headers.get('Content-Length')) || 0;
    if (!response.body) {
      const buffer = await response.arrayBuffer();
      saveWebPagBuffer(buffer);
      onProgress?.(100);
      return buffer;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        if (total) {
          onProgress?.(Math.min(100, Math.round((received / total) * 100)));
        }
      }
    }

    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress?.(100);
    saveWebPagBuffer(merged.buffer);
    console.log('PAG文件下载成功，已缓存至 Web 存储');
    return merged.buffer;
  } catch (error) {
    console.error('下载PAG文件失败:', error);
    return null;
  }
}

export async function loadPagFromCache(): Promise<ArrayBuffer | null> {
  if (isMiniProgram) {
    try {
      if (!(await isPagCached())) {
        console.log('PAG文件未缓存');
        return null;
      }
      const fs = wxApi.getFileSystemManager();
      const cachePath = getMiniCachePath();
      const buffer = fs.readFileSync(cachePath);
      console.log('从缓存读取PAG文件成功');
      return buffer as ArrayBuffer;
    } catch (error) {
      console.error('从缓存读取PAG文件失败:', error);
      return null;
    }
  }

  if (webPagBuffer) {
    return webPagBuffer;
  }

  const storage = getWebStorage();
  if (!storage) return null;
  try {
    const cached = storage.getItem(WEB_STORAGE_KEY);
    if (!cached) return null;
    const buffer = base64ToArrayBuffer(cached);
    webPagBuffer = buffer;
    console.log('从 Web 存储读取PAG文件成功');
    return buffer;
  } catch (error) {
    console.error('读取 Web 缓存失败:', error);
    return null;
  }
}

export async function clearPagCache(): Promise<boolean> {
  if (isMiniProgram) {
    try {
      if (!(await isPagCached())) {
        return true;
      }
      const fs = wxApi.getFileSystemManager();
      const cachePath = getMiniCachePath();
      return new Promise(resolve => {
        fs.unlink({
          filePath: cachePath,
          success: () => {
            console.log('PAG缓存已清理');
            resolve(true);
          },
          fail: error => {
            console.error('清除PAG缓存失败:', error);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error('清除PAG缓存失败:', error);
      return false;
    }
  }

  webPagBuffer = null;
  const storage = getWebStorage();
  if (storage) {
    try {
      storage.removeItem(WEB_STORAGE_KEY);
    } catch (error) {
      console.warn('清理 Web PAG 缓存失败:', error);
      return false;
    }
  }
  console.log('PAG Web 缓存已清理');
  return true;
}
