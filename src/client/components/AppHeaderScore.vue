<template>
    <div class="app-header-score" @click="openScoreModal">
        <div class="score blue">{{ blueScore }}</div>
        <div class="strikes blue">
            <div class="mark" :class="blueStrikes > 0 ? 'marked' : ''">X</div>
            <div class="mark" :class="blueStrikes > 1 ? 'marked' : ''">X</div>
            <div class="mark" :class="blueStrikes > 2 ? 'marked' : ''">X</div>
        </div>

        <CountdownTimer v-if="stage === 'running'" :end="endTime" :warnTime="1000 * 60"/>
        <div v-else class="title">{{ title }}</div>

        <div class="strikes red">
            <div class="mark" :class="redStrikes > 2 ? 'marked' : ''">X</div>
            <div class="mark" :class="redStrikes > 1 ? 'marked' : ''">X</div>
            <div class="mark" :class="redStrikes > 0 ? 'marked' : ''">X</div>
        </div>
        <div class="score red">{{ redScore }}</div>
    </div>
</template>


<script>
import { mapGetters } from "vuex";
import CountdownTimer from './CountdownTimer';

export default {
    components: { CountdownTimer },

    computed: {
        ...mapGetters(['blueScore', 'redScore']),

        stage() {
            return this.$store.state.game.stage;
        },

        endTime() {
            return this.$store.state.game.endTime;
        },

        title() {
            if (this.stage === 'ended') {
                return 'GAME OVER';
            }

            return 'DEVWARS';
        },

        blueStrikes() {
            return this.$store.state.game.blueStrikes;
        },

        redStrikes() {
            return this.$store.state.game.redStrikes;
        },
    },

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
    user-select: none;

    line-height: 1;
    font-weight: 300;

    .countdown-timer {
        font-size: 2.75rem;
    }

    .title {
        font-size: 2.5rem;
    }

    .team {
        margin: 0 2rem;
    }

    .score {
        margin: 0 0.5rem;
        font-size: 2.75rem;

        &.blue {
            color: $blue-team-color;
        }

        &.red {
            color: $red-team-color;
        }
    }

    .strikes {
        display: flex;
        font-size: 1.75rem;

        &.blue {
            margin-right: 2rem;
            color: $blue-team-color;
        }

        &.red {
            margin-left: 2rem;
            color: $red-team-color;
        }

        .mark {
            opacity: 0.25;

            &:not(:first-child):not(:last-child) {
                margin: 0 0.3rem;
            }

            &.marked {
                opacity: 1;
            }
        }
    }
}
</style>
