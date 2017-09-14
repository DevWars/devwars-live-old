import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    viewers: 0,
    stage: 'pre-start',
    objectives: [],
    objectivesModalOpen: false,
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

    'SHOW_OBJECTIVES_MODAL': (state) => {
        state.objectivesModalOpen = true;
    },

    'HIDE_OBJECTIVES_MODAL': (state) => {
        state.objectivesModalOpen = false;
    },
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
