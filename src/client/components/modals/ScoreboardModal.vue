<template>
    <div class="ScoreboardModal">
        <div class="header">
            <div class="score blue">{{ blueScore }}</div>
            <div class="strikes blue">
                <div class="title">Strikes</div>
                <div class="marks">
                    <span :class="['mark', { dimmed: blueStrikes <= 0 }]">X</span>
                    <span :class="['mark', { dimmed: blueStrikes <= 1 }]">X</span>
                    <span :class="['mark', { dimmed: blueStrikes <= 2 }]">X</span>
                </div>
            </div>
            <CountdownTimer :end="game.endTime"/>
            <div class="strikes red">
                <div class="title">Strikes</div>
                <div class="marks">
                    <span :class="['mark', { dimmed: redStrikes <= 2 }]">X</span>
                    <span :class="['mark', { dimmed: redStrikes <= 1 }]">X</span>
                    <span :class="['mark', { dimmed: redStrikes <= 0 }]">X</span>
                </div>
            </div>
            <div class="score red">{{ redScore }}</div>
        </div>
        <div class="objectives">
            <div class="title">Objectives</div>
            <ul>
                <li v-for="(obj, index) in objectives" :key="index" class="item">
                    <Component :is="obj.blue.icon" :class="obj.blue.classes" :title="obj.blue.title"/>
                    <div :class="`description ${obj.isBonus ? 'bonus' : ''}`">{{ obj.description }}</div>
                    <Component :is="obj.red.icon" :class="obj.red.classes" :title="obj.red.title"/>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
import { mapState, mapGetters } from 'vuex';
import CheckIcon from 'vue-material-design-icons/Check';
import CloseIcon from 'vue-material-design-icons/Close';
import LockOutlineIcon from 'vue-material-design-icons/LockOutline';
import CountdownTimer from '../CountdownTimer';

export default {
    components: { CountdownTimer },

    computed: {
        ...mapState(['game']),

        ...mapGetters(['blueScore', 'redScore']),

        blueStrikes() {
            return this.game.blueStrikes;
        },

        redStrikes() {
            return this.game.redStrikes;
        },

        objectives() {
            const iconMap = {
                incomplete: { icon: CheckIcon, title: 'Incomplete' },
                pending: { icon: CheckIcon, title: 'Pending Review' },
                complete: { icon: CheckIcon, title: 'Completed' },
                dropped: { icon: CloseIcon, title: 'Dropped' },
            };

            return this.$store.state.objectives.map((storeObjective) => {
                return ['blue', 'red'].reduce((objective, team) => {
                    const state = storeObjective[`${team}State`];
                    const classes = [team, state];
                    let { icon, title } = iconMap[state]; // eslint-disable-line prefer-const

                    if (storeObjective.isBonus) {
                        classes.push('bonus');
                        if (this.$store.getters[`${team}BonusLocked`] && state !== 'dropped') {
                            icon = LockOutlineIcon;
                            title = 'Locked';
                        }
                    }

                    return { ...objective, [team]: { icon, title, classes } };
                }, { ...storeObjective });
            });
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.ScoreboardModal {
    padding: 3.5rem;
}

.ScoreboardModal .header {
    display: flex;
    margin: auto;
    margin-bottom: 3rem;
    justify-content: center;
    white-space: nowrap;
    user-select: none;
    line-height: 1;

    .blue {
        color: $blue;
        .dimmed { color: rgba($blue, 0.25); }
    }

    .red {
        text-align: right;
        color: $red;
        .dimmed { color: rgba($red, 0.25); }
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

    .CountdownTimer {
        margin: 0 auto;
        font-size: 3.5rem;
        font-weight: 300;
    }
}

.ScoreboardModal .objectives {
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
                color: $blue;
            }

            &.red {
                color: $red;
            }

            &.pending {
                animation: pulse 750ms infinite alternate ease-in-out;
            }

            &.complete {
                opacity: 1;
            }
        }

        .bonus {
            color: $bonusColor !important;
        }
    }
}
</style>
