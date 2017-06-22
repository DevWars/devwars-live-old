import io from 'socket.io-client';
import eventBus from './event-bus';

const socket = io();

socket.on('reload', (team) => {
    eventBus.emit('reload', team);
});

export default socket;
