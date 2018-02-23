<template>
    <div class="app-header-score" @click="openScoreModal">
        <div class="team blue">
            <span class="notification" :class="blueHasPendingObjective ? 'active' : ''"></span>
            <div class="score">{{ blueScore }}</div>
            <div class="strikes">
                <div class="mark" :class="blueStrikes > 0 ? 'marked' : ''">X</div>
                <div class="mark" :class="blueStrikes > 1 ? 'marked' : ''">X</div>
                <div class="mark" :class="blueStrikes > 2 ? 'marked' : ''">X</div>
            </div>
        </div>
        <CountdownTimer v-if="stage === 'running'" :end="endTime" :warnTime="1000 * 60"/>
        <div v-else class="title">{{ title }}</div>
        <div class="team red">
            <div class="strikes">
                <div class="mark" :class="redStrikes > 2 ? 'marked' : ''">X</div>
                <div class="mark" :class="redStrikes > 1 ? 'marked' : ''">X</div>
                <div class="mark" :class="redStrikes > 0 ? 'marked' : ''">X</div>
            </div>
            <div class="score">{{ redScore }}</div>
            <span class="notification" :class="redHasPendingObjective ? 'active' : ''"></span>
        </div>
    </div>
</template>


<script>
import { mapGetters } from "vuex";
import CountdownTimer from './CountdownTimer';

export default {
    components: { CountdownTimer },

    computed: {
        ...mapGetters(['blueScore', 'redScore', 'blueHasPendingObjective', 'redHasPendingObjective']),

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
        display: flex;
        align-items: baseline;

        &.blue {
            margin-right: 2rem;
            color: $blue-team-color;
        }

        &.red {
            margin-left: 2rem;
            color: $red-team-color;
        }
    }

    .score {
        margin: 0 0.5rem;
        font-size: 2.75rem;
    }

    .strikes {
        display: flex;
        font-size: 1.75rem;

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

    .notification {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 100%;
        align-self: center;
        margin: 0 .5rem;

        &.active {
            background-color: #fff;
        }
    }
}
</style>
