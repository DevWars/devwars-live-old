import io from 'socket.io-client';
import eventBus from './event-bus';

const socket = io();

window.socket = socket;

socket.on('connect', () => {
    socket.emit('state');
});

socket.on('state', (state) => {
    eventBus.emit('objectives', state.objectives);
});

socket.on('reload', (team) => {
    eventBus.emit('reload', team);
});

export default socket;
