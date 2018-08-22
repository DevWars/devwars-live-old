<template>
    <div :class="{ collapsed }" class="ZenEditor">
        <EditorHeader
            :collapsed="collapsed"
            title="Zen Template"
            language="html"
            @collapse="collapsed = !collapsed"
        />
        <Editor :text="zenTemplate" language="html" readOnly/>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import Editor from './Editor';
import EditorHeader from './EditorHeader';

export default {
    components: { Editor, EditorHeader },

    data: () => ({
        collapsed: false,
    }),

    computed: mapState(['zenTemplate']),
};
</script>


<style lang="scss" scoped>
.ZenEditor {
    position: relative;
    display: flex;
    flex: 1 1;
    flex-flow: column;
    overflow: hidden;

    &.collapsed {
        flex: 0 0 2.25rem;

        .Editor {
            display: none;
        }
    }
}
</style>
