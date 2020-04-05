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

    editors: [],
};

const getters = {
    userPlayer({ user, players }) {
        if (user) {
            return players.find((p) => p.id === user.id);
        }
    },

    userEditor({ editors }, { userPlayer }) {
        if (userPlayer) {
            return editors.find((e) => e.id === userPlayer.editorId);
        }
    },

    visibleEditors({ editors }) {
        return editors.filter((e) => !e.hidden);
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
        return objectives.some((o) => o.blueState === 'pending');
    },

    redHasPendingObjective({ objectives }) {
        return objectives.some((o) => o.redState === 'pending');
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

    /**
     * Updates the games related templates for html, js, and css.
     * @param {object} state The current of the tore.
     * @param {object} templates The list of templates that are going used during the game.
     */
    RECEIVE_TEMPLATE(state, templates) {
        state.templates = templates;
    },

    RECEIVE_VOTES(state, votes) {
        state.votes = votes;
    },

    RECEIVE_USER(state, user) {
        state.user = user;
    },

    RECEIVE_EDITORS(state, editors) {
        state.editors = editors;
    },

    RECEIVE_EDITOR(state, editor) {
        state.editors = state.editors.map((e) =>
            e.id === editor.id ? editor : e,
        );
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
