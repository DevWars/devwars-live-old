import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    viewers: 0,
    stage: 'pre-start',
    objectives: [],
};

const getters = {
    redScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return score + objective.red;
        }, 0);
    },

    blueScore: (state) => {
        return state.objectives.reduce((score, objective) => {
            return score + objective.blue;
        }, 0);
    },
};

const mutations = {
    'RECEIVE_GAMESTATE': (state, { viewers, stage, objectives }) => {
        state.viewers = viewers;
        state.stage = stage;
        state.objectives = objectives;
    },
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
});
