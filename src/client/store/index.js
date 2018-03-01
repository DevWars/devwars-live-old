import Vue from 'vue';
import Vuex from 'vuex';
import { scoreFromVotes } from '../utils/utils';

Vue.use(Vuex);

const state = {
    user: null,
    connected: false,

    modalStack: [],

    game: {
        id: 0,
        stage: 'setup',
        startTime: 0,
        endTime: 0,
        blueStrikes: 0,
        redStrikes: 0,
    },

    objectives: [],

    players: [],

    votes: {
        blueDesign: 0,
        redDesign: 0,
        blueFunc: 0,
        redFunc: 0,
        blueTiebreaker: 0,
        redTiebreaker: 0,
    },

    editors: [
        { id: 0, team: 'blue', language: 'html', filename: 'index.html' },
        { id: 1, team: 'blue', language: 'css', filename: 'game.css' },
        { id: 2, team: 'blue', language: 'js', filename: 'game.js' },
        { id: 3, team: 'red', language: 'html', filename: 'index.html' },
        { id: 4, team: 'red', language: 'css', filename: 'game.css' },
        { id: 5, team: 'red', language: 'js', filename: 'game.js' },
    ],
};

const getters = {
    userTeam: ({ user, players }) => {
        if (!user) {
            return null;
        }

        const userPlayer = players.find(player => player.id === user.id);
        return userPlayer ? userPlayer.team : null;
    },

    currentModal(state) {
        return state.modalStack[state.modalStack.length - 1] || null;
    },

    blueScore: (state, getters) => {
        const score = state.objectives.reduce((score, objective) => {
            if (objective.blueState === 'complete') {
                score += objective.isBonus ? 2 : 1;
            }

            return score;
        }, 0);

        return score + getters.blueVoteScore;
    },

    blueVoteScore: (state) => {
        const { votes } = state;
        const design = scoreFromVotes(votes.blueDesign, votes.redDesign);
        const func = scoreFromVotes(votes.blueFunc, votes.redFunc);
        const tiebreaker = votes.blueTiebreaker > votes.redTiebreaker ? 1 : 0;

        return design + func + tiebreaker;
    },

    redScore: (state, getters) => {
        const score = state.objectives.reduce((score, objective) => {
            if (objective.redState === 'complete') {
                score += objective.isBonus ? 2 : 1;
            }

            return score;
        }, 0);

        return score + getters.redVoteScore;
    },

    redVoteScore: (state) => {
        const { votes } = state;
        const design = scoreFromVotes(votes.redDesign, votes.blueDesign);
        const func = scoreFromVotes(votes.redFunc, votes.blueFunc);
        const tiebreaker = votes.redTiebreaker > votes.blueTiebreaker ? 1 : 0;

        return design + func + tiebreaker;
    },

    blueHasPendingObjective(state) {
        return state.objectives.some(o => o.blueState === 'pending');
    },

    redHasPendingObjective(state) {
        return state.objectives.some(o => o.redState === 'pending');
    },

    blueBonusLocked(state) {
        return state.objectives.some((objective) => {
            if (!objective.isBonus) {
                const state = objective.blueState;
                return state !== 'complete' && state !== 'dropped';
            }

            return false;
        });
    },

    redBonusLocked(state) {
        return state.objectives.some((objective) => {
            if (!objective.isBonus) {
                const state = objective.redState;
                return state !== 'complete' && state !== 'dropped';
            }

            return false;
        });
    },
};

const mutations = {
    SOCKET_CONNECT: (state) => {
        state.connected = true;
    },

    SOCKET_DISCONNECT: (state) => {
        state.connected = false;
    },

    RECEIVE_GAMESTATE: (state, gameState) => {
        state.game = gameState;
    },

    RECEIVE_OBJECTIVES: (state, objectives) => {
        state.objectives = objectives;
    },

    RECEIVE_PLAYERS: (state, players) => {
        state.players = players;
    },

    RECEIVE_VOTES: (state, votes) => {
        state.votes = votes;
    },

    RECIEVE_USER: (state, user) => {
        state.user = user;
    },

    PUSH_MODAL: (state, modal) => {
        state.modalStack.push(modal);
    },

    POP_MODAL: (state) => {
        state.modalStack.pop();
        state.currentModal = null;
    },

    REPLACE_MODAL: (state, modal) => {
        state.modalStack.pop();
        state.modalStack.push(modal);
    },
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
