import { registerPlugins } from '@/plugins'
import App from './App.vue'
import store from './global';
import { createApp } from 'vue'

const app = createApp(App)
app.use(store);
registerPlugins(app)

app.mount('#app')
