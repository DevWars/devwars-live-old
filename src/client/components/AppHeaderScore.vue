<template>
    <div class="app-header-score" @click="openScoreModal">
        <div class="score blue">{{ blueScore }} xxx</div>
        <div class="timer">00:00</div>
        <div class="score red">xxx {{ redScore }}</div>
    </div>
</template>


<script>
import { mapGetters } from "vuex";

export default {
    computed: mapGetters(['blueScore', 'redScore']),

    methods: {
        openScoreModal() {
            this.$store.commit('OPEN_MODAL', { modal: 'ScoreboardModal' });
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.app-header-score {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    cursor: pointer;

    line-height: 1;
    font-weight: 300;

    .timer {
        font-size: 2.75rem;
    }

    .score {
        margin: 0 2rem;
        font-size: 2.25rem;

        &.blue {
            color: $blue-team-color;
        }

        &.red {
            color: $red-team-color;
        }
    }
}
</style>
