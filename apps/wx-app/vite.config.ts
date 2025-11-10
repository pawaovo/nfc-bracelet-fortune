import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  // 确保WASM文件被正确复制到编译后的目录
  assetsInclude: ['**/*.wasm', '**/*.wasm.br'],
});
