import 'element-plus/dist/index.css'
import './assets/main.css'
import ElementPlus from 'element-plus'

import Sys from 'sys-shim'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

const fn = async sys => {
  console.log(`初始化完成`, sys)
  window.sys = sys
  window.main = sys
  window.ws = sys.ws
  window.native = sys.native
}

// eslint-disable-next-line no-async-promise-executor
new Promise(async () => {
  if(window.sys) {
    await fn(window.sys)
  } else {
    await new Sys({
      log: true,
      wsUrl: import.meta.env.VITE_SERVER_BASEURL || undefined,
    }).then(fn).catch(err => {
      console.error(`sys-shim 初始化失败`, err)
    })
  }
  app.mount('#app')
})
