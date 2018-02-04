import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    user: null,
    currentModal: null,
    connected: false,

    game: {
        id: 0,
        stage: 'setup',
        startTime: 0,
        blueStrikes: 0,
        redStrikes: 0,
    },

    objectives: [],

    players: [],

    editors: [
        { namespace: '/0', team: 'blue', language: 'html', filename: 'index.html' },
        { namespace: '/1', team: 'blue', language: 'css', filename: 'game.css' },
        { namespace: '/2', team: 'blue', language: 'javascript', filename: 'game.js' },
        { namespace: '/3', team: 'red', language: 'html', filename: 'index.html' },
        { namespace: '/4', team: 'red', language: 'css', filename: 'game.css' },
        { namespace: '/5', team: 'red', language: 'javascript', filename: 'game.js' },
    ],
};

const getters = {
    userTeam: ({ user, players }) => {
        if (!user) {
            return null;
        }

        for (const player of players) {
            if (player.id === user.id) {
                return player.team;
            }
        }

        const player = players.find(p => p.id === user.id);
        return player ? player.team : null;
    },

    blueScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return objective.blueStatus === 'complete' ? score + 1 : score;
        }, 0);
    },

    redScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return objective.redStatus === 'complete' ? score + 1 : score;
        }, 0);
    },
};

const mutations = {
    'SOCKET_CONNECT': (state) => {
        state.connected = true;
    },

    'SOCKET_DISCONNECT': (state) => {
        state.connected = false;
    },

    'RECEIVE_GAMESTATE': (state, gameState) => {
        state.game = gameState;
    },

    'RECEIVE_OBJECTIVES': (state, objectives) => {
        state.objectives = objectives;
    },

    'RECEIVE_PLAYERS': (state, players) => {
        state.players = players;
    },

    'RECIEVE_USER': (state, user) => {
        state.user = user;
    },

    'OPEN_MODAL': (state, { modal }) => {
        state.currentModal = modal;
    },

    'CLOSE_MODAL': (state) => {
        state.currentModal = null;
    },
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
