<template>
    <div :class="['GameView', { vertical }]">
        <GameViewTeam
            :vertical="vertical"
            :hideMenu="hideMenu"
            :expanded="expandedTeam === 'blue'"
            :class="blueClasses"
            team="blue"
            @toggleExpanded="toggleExpanded('blue')"
        />
        <ZenEditor v-if="isZenGameMode"/>
        <GameViewTeam
            :vertical="vertical"
            :hideMenu="hideMenu"
            :expanded="expandedTeam === 'red'"
            :class="redClasses"
            team="red"
            @toggleExpanded="toggleExpanded('red')"
        />
    </div>
</template>


<script>
import GameViewTeam from './GameViewTeam';
import ZenEditor from './editors/ZenEditor';

export default {
    components: { GameViewTeam, ZenEditor },

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

        vertical() {
            return this.isZenGameMode;
        },

        blueClasses() {
            if (!this.expandedTeam) return '';

            return this.expandedTeam === 'blue' ? 'expanded' : 'collapsed';
        },

        redClasses() {
            if (!this.expandedTeam) return '';

            return this.expandedTeam === 'red' ? 'expanded' : 'collapsed';
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
@import 'settings.scss';
.GameView {
    display: flex;
    flex: 1;
    flex-flow: column nowrap;

    &.vertical {
        flex-flow: row nowrap;

        .GameViewTeam:not(:last-child) {
            border-right: $border !important;
            border-bottom: none !important;
        }

        .GameViewTeam:last-child {
            border-left: $border;
        }

        .GameViewTeam:not(:first-child) {
            /deep/ .GameViewTeamMenu {
                order: 2;
                border-left: $border;
                border-right: none;
            }
        }
    }

    .GameViewTeam {
        &:not(:last-child):not(.expanded) {
            border-bottom: $border;
        }

        &.collapsed {
            display: none;
        }
    }
}
</style>
