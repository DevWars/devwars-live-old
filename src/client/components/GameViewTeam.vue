<template>
    <div class="game-view-team">
        <GameViewTeamMenu
            :team="team"
            :viewSite="viewSite"
            :expanded="expanded"
            @onViewCode="viewSite = false"
            @onViewSite="viewSite = true"
            @onToggleExpanded="$emit('toggleExpanded')"
        />
        <EditorGroup :team="team" :editors="editors" :class="`editor-group ${viewSite ? 'hidden' : ''}`"/>
        <WebViewer v-if="viewSite" :team="team"/>
    </div>
</template>


<script>
import GameViewTeamMenu from "./GameViewTeamMenu";
import EditorGroup from "./EditorGroup";
import WebViewer from "./WebViewer";

export default {
    components: {
        GameViewTeamMenu,
        EditorGroup,
        WebViewer,
    },

    props: ['team', 'editors', 'expanded'],

    data() {
        return { viewSite: false };
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.game-view-team {
    display: flex;
    flex: 1;
    flex-flow: row nowrap;

    .game-view-team-menu {
        border-right: $border;
    }

    .editor-group.hidden {
        display: none;
    }
}
</style>
