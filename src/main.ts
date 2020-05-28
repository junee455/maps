import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueCookies from 'vue-cookies'
import axios from 'axios'
import cabinet from './components/cabinet/cabinet';

Vue.config.productionTip = false;

Vue.use(VueCookies)

let host = process.env['VUE_APP_HOST']

Vue.prototype.$host = host

let guardedRoutes = ["map", "cabinet"]

let isAuthorized = (next, path) => {
	axios.get(host + "api/isAuthorized", {withCredentials: true}).then((response) => {
		next()
	}).catch((_) => {
		next({name: 'login', query: {path: path}})
	})
}

router.beforeEach((to, from, next) => {
	if(guardedRoutes.includes(to.name)) {
		isAuthorized(next, to.fullPath)
	} else {
		next()
	}
})


new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
