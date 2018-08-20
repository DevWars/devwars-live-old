<template>
    <div :class="`game-view-team-menu ${team}`">
        <button :class="{ dimmed: viewSite }" title="View Code" @click="$emit('onViewCode')">
            <CodeTagsIcon/>
        </button>
        <button :class="{ dimmed: !viewSite }" title="View Site" @click="$emit('onViewSite')">
            <ApplicationIcon/>
        </button>
        <div class="fill"></div>
        <button :title="expanded ? 'Exit Fullscreen' : 'Fullscreen Team'" @click="$emit('onToggleExpanded')">
            <ArrowCollapseIcon v-if="expanded"/>
            <ArrowExpandIcon v-else/>
        </button>
    </div>
</template>


<script>
import ApplicationIcon from 'vue-material-design-icons/Application';
import ArrowCollapseIcon from 'vue-material-design-icons/ArrowCollapse';
import ArrowExpandIcon from 'vue-material-design-icons/ArrowExpand';
import CodeTagsIcon from 'vue-material-design-icons/CodeTags';

export default {
    components: {
        ApplicationIcon,
        ArrowCollapseIcon,
        ArrowExpandIcon,
        CodeTagsIcon,
    },

    props: {
        team: { type: String, required: true },
        viewSite: { type: Boolean, default: false },
        expanded: { type: Boolean, default: false },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.game-view-team-menu {
    display: flex;
    flex-flow: column nowrap;

    &.blue {
        color: $blue-team-color;
    }

    &.red {
        color: $red-team-color;
    }

    button {
        display: flex;
        width: 3rem;
        height: 3rem;
        justify-content: center;
        border: none;
        font-size: 1.5rem;
        color: inherit;

        &:active {
            background-color: transparent;
        }

        &.dimmed {
            opacity: 0.25;
        }
    }

    .fill {
        flex: 1;
    }
}
</style>
