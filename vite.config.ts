import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'
import { execSync } from 'child_process'

function getGitVersion(): string {
  try {
    return execSync('git describe --tags --always').toString().trim()
  } catch {
    return '1.0.0'
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [vue(), viteSingleFile()],
  define: {
    __APP_VERSION__: JSON.stringify(getGitVersion()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 禁用代码分割，将所有代码打包到一个文件中
        manualChunks: undefined,
        // 确保只生成一个JS文件和一个CSS文件
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
    },
    target: 'es2015',
    // 内联所有资源到HTML中
    assetsInlineLimit: 100000000, // 100MB，确保所有资源都被内联
    cssCodeSplit: false, // 禁用CSS代码分割
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy to CLIProxyAPI backend (default port 8080)
      '/v0/management': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/v1/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
  }
}))
