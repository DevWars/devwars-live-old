<template>
<div>
    <div v-for="(objective, index) in objectives">
        <p>{{ objective.title }}{{ objective.isBonus ? ' [Bonus]' : '' }}</p>
        <button @click="cycleObjectiveStatus(index, 'red')">RED: {{ objective.redStatus }}</button>
        <button @click="cycleObjectiveStatus(index, 'blue')">Blue: {{ objective.blueStatus }}</button>
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

        cycleObjectiveStatus(index, team) {
            socket.emit('cycle-objective-status', { index, team });
        },
    },
};
</script>
