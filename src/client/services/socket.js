import io from 'socket.io-client';
import eventBus from './event-bus';
import store from '../store';

const socket = io();

socket.on('connect', () => {
    socket.emit('state');
});

socket.on('state', (gameState) => {
    store.commit('RECEIVE_GAMESTATE', gameState);
});

socket.on('reload', (team) => {
    eventBus.emit('reload', team);
});

export default socket;
