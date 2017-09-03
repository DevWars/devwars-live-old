<template>
<div>
    <div v-for="(objective, index) in objectives">
        <p>{{ objective.description }}{{ objective.isBonus ? ' [Bonus]' : '' }}</p>
        <button @click="cycleObjectiveScore(index, 'blue')">Blue: {{ objective.blue }}</button>
        <button @click="cycleObjectiveScore(index, 'red')">Red: {{ objective.red }}</button>
    </div>
</div>
</template>


<script>
import socket from '../socket';
import { mapState } from 'vuex';

export default {
    computed: mapState([
        'objectives'
    ]),

    methods: {
        cycleObjectiveScore(index, team) {
            socket.emit('cycle-objective-score', { index, team });
        },
    },
};
</script>
