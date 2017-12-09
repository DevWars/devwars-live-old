import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    stage: 'pre-start',
    objectives: [],
    currentModal: null,
};

const getters = {
    blueScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return score + objective.blue;
        }, 0);
    },

    redScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return score + objective.red;
        }, 0);
    },
};

const mutations = {
    'RECEIVE_GAMESTATE': (state, { viewers, stage, objectives }) => {
        state.viewers = viewers;
        state.stage = stage;
        state.objectives = objectives;
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
