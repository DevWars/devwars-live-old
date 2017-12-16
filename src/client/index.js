import '@babel/polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import App from './App';
import WatchPage from './components/pages/WatchPage';
import PlayPage from './components/pages/PlayPage';
import './services/socket';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: WatchPage,
        },
        {
            path: '/play/:team(blue|red)/:language(html|css|javascript)',
            component: PlayPage,
            props: true,
        },
        {
            path: '/play/:team(blue|red)/js',
            redirect: '/play/:team/javascript',
        },
    ],
});

const app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
});
