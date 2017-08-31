<template>
<div>
    <div v-for="(objective, index) in objectives">
        <p>{{ objective.description }}{{ objective.isBonus ? ' [Bonus]' : '' }}</p>
        <button @click="cycleObjectiveScore(index, 'red')">Red: {{ objective.red }}</button>
        <button @click="cycleObjectiveScore(index, 'blue')">Blue: {{ objective.blue }}</button>
    </div>
</div>
</template>


<script>
import socket from '../socket';
import eventBus from '../event-bus';

export default {
    data() {
        return { objectives: [] };
    },

    created() {
        eventBus.on('objectives', this.setObjectives);
    },

    destroyed() {
        eventBus.removeListener('objectives', this.setObjectives);
    },

    methods: {
        setObjectives(objectives) {
            this.objectives = objectives;
        },

        cycleObjectiveScore(index, team) {
            socket.emit('cycle-objective-score', { index, team });
        },
    },
};
</script>
