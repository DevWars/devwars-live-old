import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './components/app.vue';
import './socket';
import './styles/index.scss';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: App },
    ],
});

const app = new Vue({
    el: '#app',
    router,
    render: h => h('router-view'),
});
