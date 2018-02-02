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
        <EditorGroup :editors="teamEditors" :class="`editor-group ${viewSite ? 'hidden' : ''}`"/>
        <WebViewer v-if="viewSite" :team="team" :delay="5000"/>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import GameViewTeamMenu from "./GameViewTeamMenu";
import EditorGroup from "./EditorGroup";
import EditorPlayer from "./EditorPlayer";
import WebViewer from "./WebViewer";

export default {
    components: {
        GameViewTeamMenu,
        EditorGroup,
        WebViewer,
    },

    props: ['team', 'expanded'],

    data() {
        return { viewSite: false };
    },

    computed: {
        ...mapState(['editors']),

        teamEditors() {
            return this.editors.filter(e => e.team === this.team);
        },
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
