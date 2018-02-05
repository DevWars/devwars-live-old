<template>
    <div class="admin-controls">
        <div class="game-controls">
            <button @click="onStartGame">Start Game</button>
            <button @click="onEndGame">End Game</button>
        </div>
        <div v-for="(objective, id) in objectives" class="objective-controls">
            <select
                v-for="team in ['blue', 'red']"
                :class="`${team} ${objective[`${team}Status`]}`"
                :value="objective[`${team}Status`]"
                @input="onObjectiveStatusChange($event, team, id)"
            >
                <option value="incomplete">Incomplete</option>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
            </select>
            <h2>{{ id + 1 }}</h2>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import socket from '../services/socket';

export default {
    computed: mapState(['game', 'objectives']),

    methods: {
        onStartGame() {
            socket.emit('start-game');
        },

        onEndGame() {
            socket.emit('end-game');
        },

        onObjectiveStatusChange(event, team, id) {
            const status = event.target.value;
            socket.emit('set-objective-status', { team, id, status });

            // Resets the selected value and wait for the backend to update it instead.
            this.$forceUpdate();
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';
.admin-controls {
    padding: 1rem 0.5rem;
    width: 24rem;

    .game-controls {
        display: flex;
        margin-bottom: 1rem;

        button {
            margin: 0 0.5rem;
        }
    }

    .objective-controls {
        display: flex;
        margin-bottom: 1rem;
        flex-flow: row nowrap;
        align-items: center;

        h2 {
            margin: 0 0.5rem;
        }

        select {
            margin: 0 0.5rem;
            width: 5.5rem;
            height: 1.75rem;

            -moz-appearance: none;

            &.blue {
                color: $blue-team-color;
                &.pending:not(:hover) {
                    border-color: $blue-team-color;
                }
            }

            &.red {
                color: $red-team-color;
                &.pending:not(:hover) {
                    border-color: $red-team-color;
                }
            }
        }
    }
}
</style>
