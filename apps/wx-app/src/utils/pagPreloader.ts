/**
 * PAG 预加载 & 缓存工具（兼容小程序 / H5）
 */

// 小程序使用cpolar服务器，H5使用本地文件
const PAG_FILE_URL_MINIPROGRAM = 'https://720dcf1a.cpolar.io/pag/loading-fortune.pag';
const PAG_FILE_URL_H5 = '/static/pag/loading_bmp.pag';
const CACHE_KEY = 'loading-fortune.pag';
const DOWNLOAD_TIMEOUT = 120000;

// 根据平台选择URL（编译时确定）
const IS_H5 = process.env.UNI_PLATFORM === 'h5';
const PAG_FILE_URL = IS_H5 ? PAG_FILE_URL_H5 : PAG_FILE_URL_MINIPROGRAM;

const globalAny =
  typeof globalThis !== 'undefined' ? (globalThis as typeof globalThis & { wx?: unknown }) : {};
const wxApi = globalAny.wx;
const isMiniProgram = !!wxApi?.getFileSystemManager;

function getMiniCachePath(): string {
  if (!isMiniProgram) {
    throw new Error('MiniProgram FS unavailable');
  }
  return `${wxApi.env.USER_DATA_PATH}/${CACHE_KEY}`;
}

/**
 * 检查PAG文件是否已缓存（仅小程序环境）
 * H5环境：本地文件无需缓存检查
 */
export async function isPagCached(): Promise<boolean> {
  if (!isMiniProgram) {
    // H5环境：本地文件始终"已缓存"
    return true;
  }

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

/**
 * 预加载PAG文件（仅小程序环境）
 * H5环境：本地文件无需预加载
 */
export async function preloadPagFile(): Promise<boolean> {
  if (!isMiniProgram) {
    // H5环境：本地文件无需预加载
    console.log('H5环境：PAG文件为本地资源，无需预加载');
    return true;
  }

  if (await isPagCached()) {
    console.log('PAG文件已缓存，无需重复下载');
    return true;
  }

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

/**
 * 下载PAG文件（带进度回调）
 * 小程序环境：从CDN下载并缓存到文件系统
 * H5环境：直接加载本地文件（浏览器自动缓存）
 */
export async function downloadPagFileWithProgress(
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer | null> {
  // 小程序环境：从CDN下载
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

  // H5环境：直接加载本地文件
  // 浏览器会自动缓存静态资源，无需手动管理localStorage
  try {
    const response = await fetch(PAG_FILE_URL);
    if (!response.ok) {
      console.error('PAG文件加载失败，状态码:', response.status);
      return null;
    }
    const buffer = await response.arrayBuffer();
    console.log(
      '✅ PAG文件加载成功（本地资源，大小:',
      (buffer.byteLength / 1024 / 1024).toFixed(2),
      'MB）'
    );
    onProgress?.(100);
    return buffer;
  } catch (error) {
    console.error('加载PAG文件失败:', error);
    return null;
  }
}

/**
 * 从缓存加载PAG文件（仅小程序环境）
 * H5环境：不使用此函数，直接调用 downloadPagFileWithProgress
 */
export async function loadPagFromCache(): Promise<ArrayBuffer | null> {
  if (!isMiniProgram) {
    // H5环境：不使用缓存机制
    console.warn('H5环境不支持loadPagFromCache，请直接使用downloadPagFileWithProgress');
    return null;
  }

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

/**
 * 清除PAG缓存（仅小程序环境）
 * H5环境：无缓存，无需清理
 */
export async function clearPagCache(): Promise<boolean> {
  if (!isMiniProgram) {
    // H5环境：无缓存，无需清理
    console.log('H5环境：无PAG缓存需要清理');
    return true;
  }

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
