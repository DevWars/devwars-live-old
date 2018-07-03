import io from 'socket.io-client';
import eventBus from './eventBus';
import store from '../store';

const socketUrl = process.env.SOCKET_URL || undefined;
const socket = io(socketUrl, {
    transports: ['websocket'],
    upgrade: false,
});

socket.on('connect', () => {
    store.commit('SOCKET_CONNECT');
    socket.emit('init');
});

socket.on('disconnect', () => {
    store.commit('SOCKET_DISCONNECT');
});

socket.on('user', (user) => {
    store.commit('RECIEVE_USER', user);
    console.info('%cAUTH:', 'color: #00ff00', { ...user });
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

socket.on('votes', (votes) => {
    store.commit('RECEIVE_VOTES', votes);
});

socket.on('reloadSite', (team) => {
    eventBus.$emit('reload-site', team);
});

socket.on('editorState', (state) => {
    store.commit('RECIEVE_EDITOR_STATE', state);
});

export default socket;
