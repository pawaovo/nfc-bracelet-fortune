/**
 * PAG文件下载测试脚本
 * 用于诊断PAG文件下载问题
 */

const https = require('https');

const PAG_FILE_URL = 'https://cdn.jsdelivr.net/gh/pawaovo/pag-files@main/loading_bmp.pag';

console.log('🔍 开始测试PAG文件下载...');
console.log('📍 URL:', PAG_FILE_URL);
console.log('');

const startTime = Date.now();

https
  .get(PAG_FILE_URL, res => {
    const { statusCode, headers } = res;

    console.log('📊 响应信息:');
    console.log('  状态码:', statusCode);
    console.log('  Content-Type:', headers['content-type']);
    console.log('  Content-Length:', headers['content-length'], 'bytes');
    console.log('');

    if (statusCode !== 200) {
      console.error('❌ 下载失败！状态码:', statusCode);
      res.resume();
      return;
    }

    let downloadedBytes = 0;
    const totalBytes = parseInt(headers['content-length'] || '0', 10);

    res.on('data', chunk => {
      downloadedBytes += chunk.length;
      const progress = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(2) : '?';
      process.stdout.write(`\r📥 下载进度: ${progress}% (${downloadedBytes}/${totalBytes} bytes)`);
    });

    res.on('end', () => {
      const duration = Date.now() - startTime;
      console.log('\n');
      console.log('✅ 下载完成！');
      console.log('  总大小:', downloadedBytes, 'bytes');
      console.log('  耗时:', duration, 'ms');
      console.log('  速度:', (downloadedBytes / 1024 / (duration / 1000)).toFixed(2), 'KB/s');
      console.log('');
      console.log('🎉 PAG文件可以正常下载！');
    });
  })
  .on('error', err => {
    console.error('❌ 下载失败:', err.message);
    console.log('');
    console.log('💡 可能的原因:');
    console.log('  1. 网络连接问题');
    console.log('  2. CDN服务不可用');
    console.log('  3. 防火墙拦截');
  });
