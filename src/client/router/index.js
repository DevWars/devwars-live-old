import Vue from 'vue';
import VueRouter from 'vue-router';
import WatchPage from '../components/pages/WatchPage';
import PlayPage from '../components/pages/PlayPage';

Vue.use(VueRouter);

export default new VueRouter({
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
