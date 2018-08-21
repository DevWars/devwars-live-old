<template>
    <div :class="[team, { collapsed, vertical }]" class="editor-header" >
        <div v-if="title" class="title">{{ title }}</div>
        <div v-else class="title placeholder">{{ placeholder }}</div>
        <div class="language" @click="$emit('collapse')">{{ language }}</div>
    </div>
</template>


<script>
export default {
    props: {
        title: { type: String, default: '' },
        placeholder: { type: String, default: '' },
        dimmed: { type: Boolean, default: false },
        language: { type: String, required: true },
        team: { type: String, default: '' },
        vertical: { type: Boolean, default: false },
        collapsed: { type: Boolean, default: false },
    },
};
</script>


<style lang="scss" scoped>
@import '../../styles/variables';
.editor-header {
    $header-height: 2.25rem;

    display: flex;
    margin: 0 1rem;
    flex: 0 0 $header-height;
    align-items: center;

    &.blue {
        color: $blue-team-color;
        .placeholder { color: rgba($blue-team-color, 0.3); }
    }

    &.red {
        color: $red-team-color;
        .placeholder { color: rgba($red-team-color, 0.3); }
    }

    &.collapsed:not(.vertical) {
        margin: 1rem 0;
        width: $header-height;
        flex: 1 0;
        flex-flow: column;
        align-items: flex-start;
        line-height: calc(#{$header-height} - 2px);

        .title {
            order: 1;
            transform: rotate(-90deg) translate(0, 100%);
            transform-origin: bottom left;
        }

        .language {
            z-index: 1;
            margin-bottom: auto;
            width: 3.5rem;
            height: 3.5rem;
            text-align: right;
            background-color: $bg-color;

            transform: rotate(-90deg) translate(0, -100%);
            transform-origin: top right;
        }
    }

    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .language {
        margin-left: auto;
        text-transform: uppercase;
        cursor: pointer;
        user-select: none;
    }
}
</style>
