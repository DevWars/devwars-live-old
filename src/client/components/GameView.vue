<template>
    <div :class="`game-view${isZenGameMode ? ' vertical' : ''}`">
        <GameViewTeam
            :vertical="isZenGameMode"
            :hide-menu="hideMenu"
            :expanded="expandedTeam === 'blue'"
            :class="blueClassModifier"
            team="blue"
            @toggleExpanded="toggleExpanded('blue')"
        />
        <ZenTemplateViewer v-if="isZenGameMode"/>
        <GameViewTeam
            :vertical="isZenGameMode"
            :hide-menu="hideMenu"
            :expanded="expandedTeam === 'red'"
            :class="redClassModifier"
            team="red"
            @toggleExpanded="toggleExpanded('red')"
        />
    </div>
</template>


<script>
import GameViewTeam from './GameViewTeam';
import ZenTemplateViewer from './ZenTemplateViewer';

export default {
    components: { GameViewTeam, ZenTemplateViewer },

    props: {
        hideMenu: { type: Boolean, default: false },
    },

    data() {
        return { expandedTeam: '' };
    },

    computed: {
        isZenGameMode() {
            return this.$store.state.game.gameMode === 'zen';
        },

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

    &.vertical {
        flex-flow: row nowrap;

        .game-view-team:not(:last-child) {
            border-right: $border !important;
            border-bottom: none !important;
        }

        .game-view-team:last-child {
            border-left: $border;
        }

        .game-view-team:not(:first-child) {
            /deep/ .game-view-team-menu {
                order: 2;
                border-left: $border;
                border-right: none;
            }
        }
    }

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
