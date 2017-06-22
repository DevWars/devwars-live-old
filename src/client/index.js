import Vue from 'vue';
import App from './components/app.vue';
import './socket';
import './styles/index.scss';

const app = new Vue({
    el: '#app',
    render: h => h(App),
});
