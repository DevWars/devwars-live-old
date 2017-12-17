<template>
    <div :class="`game-view-team-menu ${team}`">
        <button @click="$emit('onViewCode')" :class="`button ${viewSite ? 'fade' : ''}`">
            <CodeTagsIcon class="icon"/>
        </button>
        <button @click="$emit('onViewSite')" :class="`button ${viewSite ? '' : 'fade'}`">
            <ApplicationIcon class="icon"/>
        </button>
        <div class="fill"></div>
        <button @click="$emit('onToggleExpanded')" class="button">
            <ArrowCollapseIcon v-if="expanded" class="icon"/>
            <ArrowExpandIcon v-else class="icon"/>
        </button>
    </div>
</template>


<script>
import ApplicationIcon from 'vue-material-design-icons/application';
import ArrowCollapseIcon from 'vue-material-design-icons/arrow-collapse';
import ArrowExpandIcon from 'vue-material-design-icons/arrow-expand';
import CodeTagsIcon from 'vue-material-design-icons/code-tags';

export default {
    components: {
        ApplicationIcon,
        ArrowCollapseIcon,
        ArrowExpandIcon,
        CodeTagsIcon,
    },

    props: ['team', 'viewSite', 'expanded'],
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.game-view-team-menu {
    display: flex;
    flex-flow: column nowrap;

    &.blue .icon {
        fill: $blue-team-color;
    }

    &.red .icon {
        fill: $red-team-color;
    }

    .button {
        width: 3rem;
        height: 3rem;
        border: none;

        &.fade .icon {
            opacity: .25;
        }
    }

    .fill {
        flex: 1;
    }
}
</style>
