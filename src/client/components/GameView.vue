<template>
    <div class="game-view">
        <GameViewTeam
            :expanded="expandedTeam === 'blue'"
            :hide-menu="hideMenu"
            :class="blueClassModifier"
            team="blue"
            @toggleExpanded="toggleExpanded('blue')"
        />
        <GameViewTeam
            :expanded="expandedTeam === 'red'"
            :hide-menu="hideMenu"
            :class="redClassModifier"
            team="red"
            @toggleExpanded="toggleExpanded('red')"
        />
    </div>
</template>


<script>
import GameViewTeam from './GameViewTeam';

export default {
    components: { GameViewTeam },

    props: {
        hideMenu: { type: Boolean, default: false },
    },

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
