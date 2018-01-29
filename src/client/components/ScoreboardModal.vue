<template>
    <div class="scoreboard-modal">
        <div class="score-header">
            <div class="score blue">{{ blueScore }}</div>
            <div class="strikes blue">
                <div class="title">Strikes</div>
                <div class="strike-marks">X X X</div>
            </div>
            <div class="timer">00:00</div>
            <div class="strikes red">
                <div class="title">Strikes</div>
                <div class="strike-marks">X X X</div>
            </div>
            <div class="score red">{{ redScore }}</div>
        </div>
        <div class="objectives">
            <div class="title">Objectives</div>
            <ul class="list">
                <li v-for="(objective, index) in objectives" class="item">
                    <div class="score-pins blue">
                        <div :class="`pin ${objective.blueStatus === 'complete' ? 'marked' : ''}`"></div>
                        <div :class="`pin ${objective.blueStatus === 'complete' ? 'marked' : ''}`"></div>
                    </div>
                    <div class="description">{{ objective.description }}</div>
                    <div class="score-pins red">
                        <div :class="`pin ${objective.redStatus === 'complete' ? 'marked' : ''}`"></div>
                        <div :class="`pin ${objective.redStatus === 'complete' ? 'marked' : ''}`"></div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
import { mapState, mapGetters } from "vuex";
import socket from "../services/socket";

export default {
    computed: {
        ...mapState(['objectives']),
        ...mapGetters(['blueScore', 'redScore']),
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
    margin-bottom: 3.5rem;
    justify-content: center;
    white-space: nowrap;
    line-height: 1;

    .timer {
        margin: 0 3rem;
        font-size: 3.5rem;
        font-weight: 300;
    }

    .score {
        font-size: 3.5rem;
    }

    .strikes {
        margin: 0 1.5rem;
        margin-top: 10px;

        &.red {
            .title {
                text-align: right;
            }
        }

        .title {
            font-size: .875rem;
            text-transform: uppercase;
            line-height: 1;
        }

        .strike-marks {
            font-size: 1.75rem;
            font-weight: 300;
        }
    }
}

.scoreboard-modal .objectives {
    max-width: 36rem;

    .title {
        margin: 1.75rem 0;
        text-align: center;
        text-transform: uppercase;
        font-size: 1.75rem;
        font-weight: 300;
    }

    .list {
        padding: 0;
        list-style: none;
    }

    .item {
        display: flex;
        margin: 1.75rem 0;
        align-items: center;

        .description {
            margin: 0 1.5rem;
            flex: 1;
            text-align: center;
        }

        .score-pins {
            display: flex;
            padding: 0 8px;
            cursor: pointer;
            transform: skew(-12deg);

            &.blue .pin {
                background-color: $blue-team-color;
            }

            &.red .pin {
                background-color: $red-team-color;
            }

            .pin {
                width: 3px;
                height: 1.25rem;
                opacity: 0.25;

                &:first-child {
                    margin-right: 5px;
                }

                &.marked {
                    opacity: 1;
                }
            }
        }
    }
}
</style>
