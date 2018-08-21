import Vue from 'vue';
import Vuex from 'vuex';
import { scoreFromVotes } from '../utils/utils';

Vue.use(Vuex);

const state = {
    user: null,
    connected: false,
    socketId: null,

    modalStack: [],

    game: {
        id: 0,
        gameMode: 'classic',
        stage: 'setup',
        startTime: 0,
        endTime: 0,
        blueStrikes: 0,
        redStrikes: 0,
    },

    zenTemplate: '',

    objectives: [],

    players: [],

    votes: {
        blueUi: 0,
        redUi: 0,
        blueUx: 0,
        redUx: 0,
        blueTiebreaker: 0,
        redTiebreaker: 0,
    },

    editors: [
        { team: 'blue', language: 'html', filename: 'index.html' },
        { team: 'blue', language: 'css', filename: 'game.css' },
        { team: 'blue', language: 'js', filename: 'game.js' },
        { team: 'red', language: 'html', filename: 'index.html' },
        { team: 'red', language: 'css', filename: 'game.css' },
        { team: 'red', language: 'js', filename: 'game.js' },
    ].map((editor, id) => ({ id, ...editor, locked: true, hidden: false })),
};

const getters = {
    userPlayer({ user, players }) {
        if (user) {
            return players.find(p => p.id === user.id);
        }
    },

    userEditor({ editors }, { userPlayer }) {
        if (userPlayer) {
            return editors.find(e => e.id === userPlayer.editorId);
        }
    },

    visibleEditors({ editors }) {
        return editors.filter(e => !e.hidden);
    },

    currentModal({ modalStack }) {
        return modalStack[modalStack.length - 1];
    },

    blueScore({ objectives }, { blueVoteScore }) {
        const score = objectives.reduce((score, objective) => {
            if (objective.blueState === 'complete') {
                score += objective.isBonus ? 2 : 1;
            }

            return score;
        }, 0);

        return score + blueVoteScore;
    },

    blueVoteScore({ votes }) {
        const ui = scoreFromVotes(votes.blueUi, votes.redUi);
        const ux = scoreFromVotes(votes.blueUx, votes.redUx);
        const tiebreaker = votes.blueTiebreaker > votes.redTiebreaker ? 1 : 0;

        return ui + ux + tiebreaker;
    },

    redScore({ objectives }, { redVoteScore }) {
        const score = objectives.reduce((score, objective) => {
            if (objective.redState === 'complete') {
                score += objective.isBonus ? 2 : 1;
            }

            return score;
        }, 0);

        return score + redVoteScore;
    },

    redVoteScore({ votes }) {
        const ui = scoreFromVotes(votes.redUi, votes.blueUi);
        const ux = scoreFromVotes(votes.redUx, votes.blueUx);
        const tiebreaker = votes.redTiebreaker > votes.blueTiebreaker ? 1 : 0;

        return ui + ux + tiebreaker;
    },

    blueHasPendingObjective({ objectives }) {
        return objectives.some(o => o.blueState === 'pending');
    },

    redHasPendingObjective({ objectives }) {
        return objectives.some(o => o.redState === 'pending');
    },

    blueBonusLocked({ objectives }) {
        return objectives.some((objective) => {
            if (!objective.isBonus) {
                const state = objective.blueState;
                return state !== 'complete' && state !== 'dropped';
            }

            return false;
        });
    },

    redBonusLocked({ objectives }) {
        return objectives.some((objective) => {
            if (!objective.isBonus) {
                const state = objective.redState;
                return state !== 'complete' && state !== 'dropped';
            }

            return false;
        });
    },
};

const mutations = {
    SOCKET_CONNECT(state, socketId) {
        state.connected = true;
        state.socketId = socketId;
    },

    SOCKET_DISCONNECT(state) {
        state.connected = false;
        state.socketId = null;
    },

    RECEIVE_GAMESTATE(state, gameState) {
        state.game = gameState;
    },

    RECEIVE_OBJECTIVES(state, objectives) {
        state.objectives = objectives;
    },

    RECEIVE_PLAYERS(state, players) {
        state.players = players;
    },

    RECEIVE_ZEN_TEMPLATE(state, zenTemplate) {
        state.zenTemplate = zenTemplate;
    },

    RECEIVE_VOTES(state, votes) {
        state.votes = votes;
    },

    RECEIVE_USER(state, user) {
        state.user = user;
    },

    RECEIVE_EDITOR_STATE(state, editorState) {
        const editor = state.editors[editorState.id];
        if (editor) {
            Vue.set(state.editors, editorState.id, { ...editor, ...editorState });
        }
    },

    PUSH_MODAL(state, modal) {
        state.modalStack.push(modal);
    },

    POP_MODAL(state) {
        state.modalStack.pop();
        state.currentModal = null;
    },

    REPLACE_MODAL(state, modal) {
        state.modalStack.pop();
        state.modalStack.push(modal);
    },
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
