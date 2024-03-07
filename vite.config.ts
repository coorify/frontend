import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import VueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'unplugin-vue-router/vite'
import Layouts from 'vite-plugin-vue-layouts'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  plugins: [
    vue(),
    Layouts({
      layoutsDirs: ['src/layouts', 'src/system/layouts'],
      pagesDirs: ['src/pages', 'src/system/pages']
    }),
    Icons({ autoInstall: true }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      directoryAsNamespace: true,
      dirs: ['src/components', 'src/system/components'],
      resolvers: [ElementPlusResolver(), IconsResolver()]
    }),
    VueDevTools(),
    VueRouter({
      routesFolder: [
        'src/pages',
        {
          src: 'src/system/pages',
          path (file) {
            const prefix = 'src/system/pages'
            const pt = file.slice(file.lastIndexOf(prefix) + prefix.length)
            return `system${pt}`
          }
        }
      ]
    })
  ],
  base: './'
})
