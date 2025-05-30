import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/tailwind.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 导入所有免费的实心图标
import { fas } from '@fortawesome/free-solid-svg-icons'
// 导入所有免费的线性图标
import { far } from '@fortawesome/free-regular-svg-icons'
// 导入所有免费的品牌图标
import { fab } from '@fortawesome/free-brands-svg-icons'


// 添加全部图标到库中
library.add(fas, far, fab)

// 注册全局组件
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
