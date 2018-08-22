import '@babel/polyfill';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import './services/socket';

Vue.config.productionTip = false;

window.app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
});
