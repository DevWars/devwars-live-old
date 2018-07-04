<template>
    <div :class="`game-view${vertical ? ' vertical' : ''}`">
        <GameViewTeam
            :vertical="vertical"
            :hide-menu="hideMenu"
            :expanded="expandedTeam === 'blue'"
            :class="blueClassModifier"
            team="blue"
            @toggleExpanded="toggleExpanded('blue')"
        />
        <!--CodeViewer Language needs to be dynamic later.-->
        <CodeViewer language="html"/>
        <GameViewTeam
            :vertical="vertical"
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
import CodeViewer from './CodeViewer'

export default {
    components: { GameViewTeam, CodeViewer },

    props: {
        hideMenu: { type: Boolean, default: false },
    },

    data() {
        return { expandedTeam: '' };
    },

    computed: {
        vertical() {
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

        .game-view-team:not(:last-child):not(.expanded) {
            border-right: $border;
            border-bottom: none;
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
