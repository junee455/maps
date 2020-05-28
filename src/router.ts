import Vue from 'vue';
import Router from 'vue-router';
import Map from '@/components/map/map.vue';
import Login from '@/components/login/login.vue';
import Cabinet from '@/components/cabinet/cabinet.vue';
import mainPage from '@/components/mainPage.vue'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login*',
      name: 'login',
      component: Login,
    },
		{
      path: '/cabinet',
      name: 'cabinet',
      component: Cabinet,
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
    },
		{
			path: '/*',
      name: 'main page',
      component: mainPage,
		},
  ],
});
