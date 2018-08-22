<template>
    <div class="GameViewTeam">
        <GameViewTeamMenu
            v-if="!hideMenu"
            :team="team"
            :viewSite="viewSite"
            :expanded="expanded"
            @onViewCode="viewSite = false"
            @onViewSite="viewSite = true"
            @onToggleExpanded="$emit('toggleExpanded')"
        />
        <EditorGroup
            :editors="teamEditors"
            :vertical="vertical"
            :class="{ hidden: viewSite }"
        />
        <WebViewer v-if="viewSite" :team="team" :delay="5000"/>
    </div>
</template>


<script>
import GameViewTeamMenu from './GameViewTeamMenu';
import EditorGroup from './EditorGroup';
import WebViewer from './WebViewer';

export default {
    components: {
        GameViewTeamMenu,
        EditorGroup,
        WebViewer,
    },

    props: {
        team: { type: String, required: true },
        vertical: { type: Boolean, default: false },
        hideMenu: { type: Boolean, default: false },
        expanded: { type: Boolean, default: false },
        showHiddenEditors: { type: Boolean, default: false },
    },

    data() {
        return { viewSite: false };
    },

    computed: {
        teamEditors() {
            return this.$store.getters.visibleEditors
                .filter(e => e.team === this.team);
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.GameViewTeam {
    display: flex;
    flex: 1 1;
    flex-flow: row nowrap;

    .GameViewTeamMenu {
        border-right: $border;
    }

    .EditorGroup.hidden {
        display: none;
    }
}
</style>
