<template>
    <div class="TheHeaderScore" @click="openScoreModal">
        <div class="team blue">
            <span :class="['notification', { active: blueHasPendingObjective }]"></span>
            <div class="score">{{ blueScore }}</div>
            <div class="strikes">
                <span :class="['mark', { dimmed: game.blueStrikes <= 0 }]">X</span>
                <span :class="['mark', { dimmed: game.blueStrikes <= 1 }]">X</span>
                <span :class="['mark', { dimmed: game.blueStrikes <= 2 }]">X</span>
            </div>
        </div>

        <CountdownTimer v-if="stage === 'running'" :end="game.endTime" :warnTime="1000 * 60"/>
        <div v-else class="title">{{ title }}</div>

        <div class="team red">
            <div class="strikes">
                <span :class="['mark', { dimmed: game.redStrikes <= 2 }]">X</span>
                <span :class="['mark', { dimmed: game.redStrikes <= 1 }]">X</span>
                <span :class="['mark', { dimmed: game.redStrikes <= 0 }]">X</span>
            </div>
            <div class="score">{{ redScore }}</div>
            <span :class="['notification', { active: redHasPendingObjective }]"></span>
        </div>
    </div>
</template>


<script>
import { mapState, mapGetters } from 'vuex';
import CountdownTimer from './CountdownTimer';

export default {
    components: { CountdownTimer },

    computed: {
        ...mapState(['game']),

        ...mapGetters(['blueScore', 'redScore', 'blueHasPendingObjective', 'redHasPendingObjective']),

        stage() {
            return this.game.stage;
        },

        title() {
            return this.stage === 'ended' ? 'GAME OVER' : 'STARTING';
        },
    },

    methods: {
        openScoreModal() {
            this.$store.commit('PUSH_MODAL', { name: 'ScoreboardModal' });
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.TheHeaderScore {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;

    line-height: 1;
    font-weight: 300;

    .title {
        font-size: 2.5rem;
    }

    .team {
        display: flex;
        align-items: baseline;

        &.blue {
            margin-right: 2rem;
            color: $blue;

            .dimmed {
                color: rgba($blue, 0.25);
            }
        }

        &.red {
            margin-left: 2rem;
            color: $red;

            .dimmed {
                color: rgba($red, 0.25);
            }
        }
    }

    .score {
        margin: 0 0.5rem;
        font-size: 2.75rem;
    }

    .strikes {
        display: flex;
        font-size: 1.75rem;

        .mark:not(:first-child):not(:last-child) {
            margin: 0 0.3rem;
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

    .CountdownTimer {
        font-size: 2.75rem;
    }
}
</style>
