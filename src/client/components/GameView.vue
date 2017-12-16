<template>
    <div class="game-view">
        <GameViewTeam
            team="blue"
            :editors="['html', 'css', 'javascript']"
            :expanded="expandedTeam === 'blue'"
            @toggleExpanded="toggleExpanded('blue')"
            :class="blueClassModifier"
        />
        <GameViewTeam
            team="red"
            :editors="['html', 'css', 'javascript']"
            :expanded="expandedTeam === 'red'"
            @toggleExpanded="toggleExpanded('red')"
            :class="redClassModifier"
        />
    </div>
</template>


<script>
import GameViewTeam from "./GameViewTeam";

export default {
    components: { GameViewTeam },

    data() {
        return { expandedTeam: '' };
    },

    computed: {
        blueClassModifier() {
            if (this.expandedTeam) {
                return this.expandedTeam === 'blue' ? 'expanded' : 'collapsed';
            }

            return '';
        },

        redClassModifier() {
            if (this.expandedTeam) {
                return this.expandedTeam === 'red' ? 'expanded' : 'collapsed';
            }

            return '';
        },
    },

    methods: {
        toggleExpanded(team) {
            this.expandedTeam = team === this.expandedTeam ? '' : team;
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.game-view {
    display: flex;
    flex: 1;
    flex-flow: column nowrap;

    .game-view-team {
        &:not(:last-child):not(.expanded) {
            border-bottom: $border;
        }

        &.collapsed {
            display: none;
        }
    }
}
</style>
