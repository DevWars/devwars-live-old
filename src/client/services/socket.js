import io from 'socket.io-client';
import eventBus from './eventBus';
import store from '../store';
import { getCookieValue } from '../utils/utils';

const socket = io({
    transports: ['websocket'],
    upgrade: false,
});

socket.on('connect', () => {
    store.commit('SOCKET_CONNECT');
    socket.emit('init');

    const token = getCookieValue('token');
    if (token) {
        socket.emit('auth', token, (user) => {
            if (user) {
                store.commit('RECIEVE_USER', user);
            }
        });
    }
});

socket.on('disconnect', () => {
    store.commit('SOCKET_DISCONNECT');
});

socket.on('state', (state) => {
    store.commit('RECEIVE_GAMESTATE', state);
});

socket.on('objectives', (objectives) => {
    store.commit('RECEIVE_OBJECTIVES', objectives);
});

socket.on('players', (players) => {
    store.commit('RECEIVE_PLAYERS', players);
});

socket.on('reload-site', (team) => {
    eventBus.emit('reload-site', team);
});

export default socket;
