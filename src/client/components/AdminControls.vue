<template>
    <div class="AdminControls">
        <div class="controls">
            <div class="row">
                <button @click="onResetGame">Reset Game</button>
                <button @click="onStartGame">Start Game</button>
                <button @click="onEndGame">End Game</button>
            </div>
        </div>
        <div class="controls">
            <div v-for="(objective, id) in objectives" :key="id" class="row">
                <select
                    v-for="team in ['blue', 'red']"
                    :key="team"
                    :class="[team, objective[`${team}State`]]"
                    :value="objective[`${team}State`]"
                    @input="onObjectiveStateChange($event, team, id)"
                >
                    <option value="incomplete">Incomplete</option>
                    <option value="pending">Pending</option>
                    <option value="complete">Complete</option>
                    <option value="dropped">Dropped</option>
                </select>
                <h2 :class="{ bonus: objective.isBonus }">{{ id + 1 }}</h2>
            </div>
        </div>
        <div class="controls">
            <div class="row">
                <button class="blue" @click="onAddStrike('blue')">Strike Blue</button>
                <button class="red" @click="onAddStrike('red')">Strike Red</button>
            </div>
        </div>

        <div class="controls">
            <div v-for="editor of $store.state.editors" :key="editor.id" class="row">
                <button :class="editor.team" @click="onToggleEditorLocked(editor)">
                    {{ editor.locked ? 'Unlock' : 'Lock' }}
                </button>
                <button :class="editor.team" @click="onToggleEditorHidden(editor)">
                    {{ editor.hidden ? 'Show' : 'Hide' }}
                </button>
                <h2>{{ editor.language.toUpperCase() }}</h2>
            </div>
        </div>

        <div class="controls">
            <div class="row">
                <button class="blue" @click="RELOAD">NUKE</button>
            </div>
        </div>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import socket from '../services/socket';

export default {
    computed: mapState(['game', 'objectives']),

    methods: {
        onResetGame() {
            socket.emit('reset-game');
        },

        onStartGame() {
            socket.emit('start-game');
        },

        onEndGame() {
            socket.emit('end-game');
        },

        onObjectiveStateChange(event, team, id) {
            const state = event.target.value;
            socket.emit('set-objective-state', { team, id, state });

            // Resets the selected value and wait for the backend to update it instead.
            this.$forceUpdate();
        },

        onAddStrike(team) {
            socket.emit('add-strike', team);
        },

        onToggleEditorLocked(editor) {
            socket.emit('toggle-editor-locked', { id: editor.id, locked: !editor.locked });
        },

        onToggleEditorHidden(editor) {
            socket.emit('toggle-editor-hidden', { id: editor.id, hidden: !editor.hidden });
        },

        RELOAD() {
            socket.emit('RELOAD');
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.AdminControls {
    padding: 1rem 0.5rem;

    .controls {
        margin-bottom: 2rem;

        .row {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;

            &:not(:last-child) {
                margin-bottom: 1rem;
            }
        }

        h2 {
            margin: 0 0.25rem;
            line-height: 1;
            font-size: 1.25rem;

            &.bonus {
                color: $bonusColor;
            }
        }

        button,
        select {
            margin-right: 0.5rem;
            width: 6rem;

            &.blue {
                color: $blue;
            }

            &.red {
                color: $red;
            }

            &.pending:not(:hover) {
                border-color: currentColor;
            }
        }
    }
}
</style>
