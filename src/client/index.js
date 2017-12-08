import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import App from './app.vue';
import WatchView from './components/views/watch-view.vue';
import PlayView from './components/views/play-view.vue';
import './services/socket';
import './styles/index.scss';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: WatchView },
        { path: '/play/:team(blue|red)/:language(html|css|javascript)', component: PlayView, props: true },
    ],
});

const app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
});
