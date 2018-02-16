<template>
    <div class="scoreboard-modal">
        <div class="score-header">
            <div class="score blue">{{ blueScore }}</div>
            <div class="strikes blue">
                <div class="title">Strikes</div>
                <div class="marks">
                    <div class="mark" :class="blueStrikes > 0 ? 'marked' : ''">X</div>
                    <div class="mark" :class="blueStrikes > 1 ? 'marked' : ''">X</div>
                    <div class="mark" :class="blueStrikes > 2 ? 'marked' : ''">X</div>
                </div>
            </div>
            <CountdownTimer :end="endTime"/>
            <div class="strikes red">
                <div class="title">Strikes</div>
                <div class="marks">
                    <div class="mark" :class="redStrikes > 2 ? 'marked' : ''">X</div>
                    <div class="mark" :class="redStrikes > 1 ? 'marked' : ''">X</div>
                    <div class="mark" :class="redStrikes > 0 ? 'marked' : ''">X</div>
                </div>
            </div>
            <div class="score red">{{ redScore }}</div>
        </div>
        <div class="objectives">
            <div class="title">Objectives</div>
            <ul class="list">
                <li v-for="(objective, index) in objectives" class="item">
                    <CloseIcon
                        v-if="objective.blueState === 'dropped'"
                        :class="`check blue ${objective.blueState}${objective.isBonus ? ' bonus' : ''}`"
                        :title="objective.blueState"
                    />
                    <LockOutlineIcon
                        v-else-if="objective.isBonus && blueBonusLocked"
                        :class="`lock blue ${objective.blueState}${objective.isBonus ? ' bonus' : ''}`"
                        title="locked"
                    />
                    <CheckIcon
                        v-else
                        :class="`check blue ${objective.blueState}${objective.isBonus ? ' bonus' : ''}`"
                        :title="objective.blueState"
                        @click.native="togglePending('blue', index)"
                    />
                    <div class="description" :class="objective.isBonus ? 'bonus' : ''">{{ objective.description }}</div>
                    <CloseIcon
                        v-if="objective.redState === 'dropped'"
                        :class="`check red ${objective.redState}${objective.isBonus ? ' bonus' : ''}`"
                        :title="objective.redState"
                    />
                    <LockOutlineIcon
                        v-else-if="objective.isBonus && redBonusLocked"
                        :class="`lock red ${objective.redState}${objective.isBonus ? ' bonus' : ''}`"
                        :title="objective.redState"
                    />
                    <CheckIcon
                        v-else
                        :class="`check red ${objective.redState}${objective.isBonus ? ' bonus' : ''}`"
                        :title="objective.redState"
                        @click.native="togglePending('red', index)"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
import { mapState, mapGetters } from "vuex";
import CheckIcon from 'vue-material-design-icons/check';
import CloseIcon from 'vue-material-design-icons/close';
import LockOutlineIcon from 'vue-material-design-icons/lock-outline';
import socket from "../services/socket";
import CountdownTimer from './CountdownTimer';

export default {
    components: { CountdownTimer, CheckIcon, CloseIcon, LockOutlineIcon },

    computed: {
        ...mapState(['objectives', 'votes']),
        ...mapGetters([
            'userTeam',
            'blueScore',
            'redScore',
            'blueBonusLocked',
            'redBonusLocked',
        ]),

        endTime() {
            return this.$store.state.game.endTime;
        },

        blueStrikes() {
            return this.$store.state.game.blueStrikes;
        },

        redStrikes() {
            return this.$store.state.game.redStrikes;
        },
    },

    methods: {
        togglePending(team, id) {
            if (this.userTeam === team) {
                socket.emit('objective-notify', { team, id });
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.scoreboard-modal {
    padding: 3.5rem;

    .blue {
        color: $blue-team-color;
    }

    .red {
        color: $red-team-color;
    }
}

.scoreboard-modal .score-header {
    display: flex;
    margin: auto;
    margin-bottom: 3rem;
    justify-content: center;
    white-space: nowrap;
    user-select: none;
    line-height: 1;

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

        &.red .title {
            text-align: right;
        }

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
                opacity: 0.25;

                &:not(:first-child):not(:last-child) {
                    margin: 0 0.5rem;
                }

                &.marked {
                    opacity: 1;
                }
            }
        }
    }
}

.scoreboard-modal .objectives {
    margin: auto;
    max-width: 36rem;

    .title {
        margin-bottom: 1.75rem;
        text-align: center;
        text-transform: uppercase;
        font-size: 2rem;
        font-weight: 300;
    }

    .list {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .item {
        display: flex;
        margin-top: 1.5rem;
        align-items: center;

        .description {
            margin: 0 1.5rem;
            flex: 1;
            text-align: center;
            word-break: break-all;

            &.bonus {
                color: $bonus-color;
            }
        }

        .material-design-icon {
            opacity: 0.25;
            font-size: 1.75rem;
            user-select: none;

            &.check {
                cursor: pointer;
            }

            &.blue {
               color: $blue-team-color;
            }

            &.red {
                color: $red-team-color;
            }

            &.bonus {
                color: $bonus-color !important;
            }

            &.pending {
                animation: pulse 750ms infinite alternate ease-in-out;
            }

            &.complete {
                opacity: 1;
            }
        }
    }
}
</style>
