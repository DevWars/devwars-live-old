import Vue from 'vue';
import io from 'socket.io-client';
import eventBus from './event-bus';
import App from './components/app.vue';
import './styles/index.scss';

const socket = io();

socket.on('reload', (team) => {
    eventBus.emit('reload', team);
});

const app = new Vue({
    el: '#app',
    render: h => h(App),
});
