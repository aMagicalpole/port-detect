import 'element-plus/dist/index.css'
import './assets/main.css'
import ElementPlus from 'element-plus'

import { createApp } from 'vue'
import App from './App.vue'

if (window.Sys) {
  new window.Sys().then(async (main) => {
    window.main = main
    const app = createApp(App)
    app.use(ElementPlus)
    app.mount('#app')
  })
}
