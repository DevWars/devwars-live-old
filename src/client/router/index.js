import Vue from 'vue';
import VueRouter from 'vue-router';
import BroadcastPage from '../components/pages/BroadcastPage';
import PlayPage from '../components/pages/PlayPage';
import WatchPage from '../components/pages/WatchPage';

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: WatchPage,
        },
        {
            path: '/play/:team(blue|red)/:language(html|css|js)',
            component: PlayPage,
            props: true,
        },
        {
            path: '/play/:team(blue|red)/javascript',
            redirect: '/play/:team/js',
        },
        {
            path: '/broadcast',
            component: BroadcastPage,
        },
    ],
});
