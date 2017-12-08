<template>
<div class="modal" @click="close">
    <div class="modal__container" @click.stop>
        <div class="game-score">
            <div class="game-score__score game-score__score--blue">{{blueScore}}</div>
            <div class="game-score__strikes game-score__strikes--blue">
                <div class="game-score__strikes-title">Strikes</div>
                <div class="game-score__strikes-marks">X X X</div>
            </div>
            <div class="game-score__timer">00:00</div>
            <div class="game-score__strikes game-score__strikes--red">
                <div class="game-score__strikes-title">Strikes</div>
                <div class="game-score__strikes-marks">X X X</div>
            </div>
            <div class="game-score__score game-score__score--red">{{redScore}}</div>
        </div>
        <div class="objectives">
            <h1 class="objectives__title">Objectives</h1>
            <ul class="objectives__list">
                <li v-for="(objective, index) in objectives" class="objectives__item">
                    <div class="objectives__score-pins" @click="cycleObjectiveScore(index, 'blue')">
                        <div :class="`objectives__score-pin objectives__score-pin--blue${objective.blue > 0 ? ' objectives__score-pin--checked' : ''}`"></div>
                        <div :class="`objectives__score-pin objectives__score-pin--blue${objective.blue > 1 ? ' objectives__score-pin--checked' : ''}`"></div>
                    </div>
                    <div class="objectives__description">{{objective.description}}</div>
                    <div class="objectives__score-pins" @click="cycleObjectiveScore(index, 'red')">
                        <div :class="`objectives__score-pin objectives__score-pin--red${objective.red > 0 ? ' objectives__score-pin--checked' : ''}`"></div>
                        <div :class="`objectives__score-pin objectives__score-pin--red${objective.red > 1 ? ' objectives__score-pin--checked' : ''}`"></div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>
</template>


<script>
import socket from '../services/socket';
import { mapState, mapGetters } from 'vuex';

export default {
    computed: Object.assign({},
        mapState([
            'objectives',
        ]),
        mapGetters([
            'blueScore',
            'redScore',
        ]),
    ),

    methods: {
        close() {
            this.$store.commit('HIDE_OBJECTIVES_MODAL');
        },

        cycleObjectiveScore(index, team) {
            socket.emit('cycle-objective-score', { index, team });
        },
    },
};
</script>
