/**
 * PAG文件预加载工具
 * 用于在用户浏览其他页面时，后台静默下载PAG文件
 */

// 使用自己的服务器（通过cpolar）
const PAG_FILE_URL = 'https://720dcf1a.cpolar.io/pag/loading-fortune.pag';
const CACHE_KEY = 'loading-fortune.pag';
const DOWNLOAD_TIMEOUT = 120000; // 下载超时时间：120秒

/**
 * 获取缓存文件路径
 */
function getCacheFilePath(): string {
  return `${wx.env.USER_DATA_PATH}/${CACHE_KEY}`;
}

/**
 * 检查PAG文件是否已缓存
 */
export async function isPagCached(): Promise<boolean> {
  try {
    const filePath = getCacheFilePath();
    const fs = wx.getFileSystemManager();

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
 * 预加载PAG文件（静默下载）
 * @returns Promise<boolean> 是否下载成功
 */
export async function preloadPagFile(): Promise<boolean> {
  try {
    // 1. 检查是否已缓存
    const cached = await isPagCached();
    if (cached) {
      console.log('PAG文件已缓存，无需重复下载');
      return true;
    }

    console.log('开始预加载PAG文件...');

    // 2. 下载文件
    return new Promise(resolve => {
      wx.downloadFile({
        url: PAG_FILE_URL,
        timeout: DOWNLOAD_TIMEOUT, // 增加超时时间
        success: res => {
          if (res.statusCode === 200) {
            // 3. 保存到本地缓存
            const fs = wx.getFileSystemManager();
            const cachePath = getCacheFilePath();

            try {
              fs.saveFileSync(res.tempFilePath, cachePath);
              console.log('PAG文件预加载成功，已缓存到:', cachePath);
              resolve(true);
            } catch (error) {
              console.error('PAG文件缓存失败:', error);
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
  } catch (error) {
    console.error('预加载PAG文件失败:', error);
    return false;
  }
}

/**
 * 下载PAG文件（带进度回调）
 * @param onProgress 进度回调函数
 * @returns Promise<ArrayBuffer | null>
 */
export async function downloadPagFileWithProgress(
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer | null> {
  try {
    console.log('开始下载PAG文件...');

    return new Promise(resolve => {
      const downloadTask = wx.downloadFile({
        url: PAG_FILE_URL,
        timeout: DOWNLOAD_TIMEOUT, // 增加超时时间
        success: res => {
          if (res.statusCode === 200) {
            // 读取文件为ArrayBuffer
            const fs = wx.getFileSystemManager();
            try {
              const buffer = fs.readFileSync(res.tempFilePath);

              // 保存到缓存
              const cachePath = getCacheFilePath();
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

      // 监听下载进度
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

/**
 * 从缓存加载PAG文件
 * @returns Promise<ArrayBuffer | null>
 */
export async function loadPagFromCache(): Promise<ArrayBuffer | null> {
  try {
    const cached = await isPagCached();
    if (!cached) {
      console.log('PAG文件未缓存');
      return null;
    }

    const fs = wx.getFileSystemManager();
    const cachePath = getCacheFilePath();

    const buffer = fs.readFileSync(cachePath);
    console.log('从缓存加载PAG文件成功');
    return buffer as ArrayBuffer;
  } catch (error) {
    console.error('从缓存加载PAG文件失败:', error);
    return null;
  }
}

/**
 * 清除PAG文件缓存
 */
export async function clearPagCache(): Promise<boolean> {
  try {
    const cached = await isPagCached();
    if (!cached) {
      return true;
    }

    const fs = wx.getFileSystemManager();
    const cachePath = getCacheFilePath();

    return new Promise(resolve => {
      fs.unlink({
        filePath: cachePath,
        success: () => {
          console.log('PAG缓存已清除');
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
