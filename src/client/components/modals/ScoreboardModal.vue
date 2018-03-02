<template>
    <div class="scoreboard-modal">
        <div class="score-header">
            <div class="score blue">{{ blueScore }}</div>
            <div class="strikes blue">
                <div class="title">Strikes</div>
                <div class="marks">
                    <span :class="`mark ${blueStrikes > 0 ? '' : 'faded'}`">X</span>
                    <span :class="`mark ${blueStrikes > 1 ? '' : 'faded'}`">X</span>
                    <span :class="`mark ${blueStrikes > 2 ? '' : 'faded'}`">X</span>
                </div>
            </div>
            <CountdownTimer :end="endTime"/>
            <div class="strikes red">
                <div class="title">Strikes</div>
                <div class="marks">
                    <span :class="`mark ${redStrikes > 2 ? '' : 'faded'}`">X</span>
                    <span :class="`mark ${redStrikes > 1 ? '' : 'faded'}`">X</span>
                    <span :class="`mark ${redStrikes > 0 ? '' : 'faded'}`">X</span>
                </div>
            </div>
            <div class="score red">{{ redScore }}</div>
        </div>
        <div class="objectives">
            <div class="title">Objectives</div>
            <ul>
                <li v-for="(objective, index) in objectives" :key="index" class="item">
                    <component :is="objective.blue.icon" :class="objective.blue.classNames"/>
                    <div :class="`description ${objective.isBonus ? 'bonus' : ''}`">{{ objective.description }}</div>
                    <component :is="objective.red.icon" :class="objective.red.classNames"/>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import CheckIcon from 'vue-material-design-icons/check';
import CloseIcon from 'vue-material-design-icons/close';
import LockOutlineIcon from 'vue-material-design-icons/lock-outline';
import CountdownTimer from '../CountdownTimer';

const iconMap = {
    incomplete: 'CheckIcon',
    pending: 'CheckIcon',
    complete: 'CheckIcon',
    dropped: 'CloseIcon',
};

export default {
    components: { CountdownTimer, CheckIcon, CloseIcon, LockOutlineIcon },

    computed: {
        ...mapGetters(['blueScore', 'redScore']),

        endTime() {
            return this.$store.state.game.endTime;
        },

        blueStrikes() {
            return this.$store.state.game.blueStrikes;
        },

        redStrikes() {
            return this.$store.state.game.redStrikes;
        },

        objectives() {
            return this.$store.state.objectives.map((storeObjective) => {
                const objective = { ...storeObjective };
                for (const team of ['blue', 'red']) {
                    const state = storeObjective[`${team}State`];
                    let icon = iconMap[state];
                    let classNames = `${team} ${state}`;

                    if (storeObjective.isBonus) {
                        classNames += ' bonus';
                        if (this.$store.getters[`${team}BonusLocked`] && state !== 'dropped') {
                            icon = 'LockOutlineIcon';
                        }
                    }

                    objective[team] = { icon, classNames };
                }

                return objective;
            });
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';

.scoreboard-modal {
    padding: 3.5rem;
}

.scoreboard-modal .score-header {
    display: flex;
    margin: auto;
    margin-bottom: 3rem;
    justify-content: center;
    white-space: nowrap;
    user-select: none;
    line-height: 1;

    .blue {
        color: $blue-team-color;

        .faded {
            color: rgba($blue-team-color, 0.25);
        }
    }

    .red {
        color: $red-team-color;
        text-align: right;

        .faded {
            color: rgba($red-team-color, 0.25);
        }
    }

    .countdown-timer {
        margin: 0 auto;
        font-size: 3.5rem;
        font-weight: 300;
    }

    .score {
        font-size: 3.5rem;
    }

    .strikes {
        margin: 0 1.5rem;
        margin-top: 5px;

        .title {
            font-size: 0.875rem;
            text-transform: uppercase;
            line-height: 1.2;
        }

        .marks {
            display: flex;

            .mark {
                font-size: 2rem;
                font-weight: 300;
                display: block;

                &:not(:first-child):not(:last-child) {
                    margin: 0 0.5rem;
                }
            }
        }
    }
}

.scoreboard-modal .objectives {
    margin: auto;

    .title {
        margin-bottom: 1.75rem;
        text-align: center;
        text-transform: uppercase;
        font-size: 2rem;
        font-weight: 300;
    }

    .item {
        display: flex;
        margin-top: 1.5rem;
        align-items: center;

        .description {
            margin: 0 1.5rem;
            flex: 1;
            text-align: center;
            word-break: break-word;
        }

        .material-design-icon {
            opacity: 0.25;
            font-size: 1.75rem;
            user-select: none;

            &.blue {
                color: $blue-team-color;
            }

            &.red {
                color: $red-team-color;
            }

            &.pending {
                animation: pulse 750ms infinite alternate ease-in-out;
            }

            &.complete {
                opacity: 1;
            }
        }

        .bonus {
            color: $bonus-color !important;
        }
    }
}
</style>
