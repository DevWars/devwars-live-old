import io from 'socket.io-client';
import eventBus from './eventBus';
import store from '../store';

const socket = io(window.SOCKET_URL, {
    transports: ['websocket'],
    upgrade: false,
});

socket.on('connect', () => {
    store.commit('SOCKET_CONNECT', socket.id);
    socket.emit('init');
});

socket.on('disconnect', () => {
    store.commit('SOCKET_DISCONNECT');
});

socket.on('user', (user) => {
    store.commit('RECEIVE_USER', user);
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

socket.on('zenTemplate', (zenTemplate) => {
    store.commit('RECEIVE_ZEN_TEMPLATE', zenTemplate);
});

socket.on('templates', (templates) => {
    store.commit('RECEIVE_TEMPLATE', templates);
});

socket.on('votes', (votes) => {
    store.commit('RECEIVE_VOTES', votes);
});

socket.on('reloadSite', (team) => {
    eventBus.$emit('reload-site', team);
});

socket.on('editors', (editors) => {
    store.commit('RECEIVE_EDITORS', editors);
});

socket.on('editor', (editor) => {
    store.commit('RECEIVE_EDITOR', editor);
});

socket.on('e.state', ([id, state]) => {
    eventBus.$emit(`editor-${id}.state`, state);
});

socket.on('e.text', ([id, text]) => {
    eventBus.$emit(`editor-${id}.text`, text);
});

socket.on('e.user', ([id, payload]) => {
    eventBus.$emit(`editor-${id}.user`, payload);
});

socket.on('e.o', ([id, operation]) => {
    eventBus.$emit(`editor-${id}.o`, operation);
});

socket.on('e.s', ([id, selections]) => {
    eventBus.$emit(`editor-${id}.s`, selections);
});

export default socket;
