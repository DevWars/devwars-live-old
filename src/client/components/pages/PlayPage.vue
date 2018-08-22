<template>
    <div class="PlayPage">
        <div class="panel editor">
            <TheHeader>
                <PlaylistCheckIcon
                    slot="left"
                    :class="`objectivesModalIcon ${team}`"
                    title="View Objectives"
                    @click.native="openObjectivesModal"
                />
            </TheHeader>
            <LiveEditor
                v-if="playerEditor"
                :id="playerEditor.id"
                :key="playerEditor.id"
                :team="playerEditor.team"
                :language="playerEditor.language"
                :locked="playerEditor.locked"
                :collapsible="false"
                editable
            />
        </div>
        <div class="panel team">
            <WebViewer :team="team"/>
            <EditorGroup :editors="teamEditors"/>
        </div>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import PlaylistCheckIcon from 'vue-material-design-icons/CheckboxMultipleMarkedOutline';
import TheHeader from '../TheHeader';
import EditorGroup from '../EditorGroup';
import LiveEditor from '../editors/LiveEditor';
import WebViewer from '../WebViewer';

export default {
    components: {
        TheHeader,
        EditorGroup,
        LiveEditor,
        WebViewer,
        PlaylistCheckIcon,
    },

    props: {
        team: { type: String, required: true },
        language: { type: String, required: true },
    },

    computed: {
        ...mapState(['editors']),

        playerEditor() {
            return this.editors.find((editor) => {
                return (editor.team === this.team && editor.language === this.language);
            });
        },

        teamEditors() {
            return this.editors.filter((editor) => {
                return (editor.team === this.team && editor.language !== this.language);
            });
        },
    },

    methods: {
        openObjectivesModal() {
            this.$store.commit('PUSH_MODAL', { name: 'ObjectivesModal', props: { team: this.team } });
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.PlayPage {
    display: flex;
    height: 100%;
    flex-flow: row nowrap;

    .panel {
        display: flex;
        flex: 1;
        flex-flow: column nowrap;

        &.editor {
            max-width: 45rem;
            border-right: $border;
        }

        .WebViewer {
            flex: 1 1 100%;
        }

        .EditorGroup {
            flex: 1 1 80%;
            border-top: $border;
        }
    }

    .objectivesModalIcon {
        margin: 0 1rem;
        font-size: 1.5rem;
        cursor: pointer;

        &.blue {
            color: $blue;
        }

        &.red {
            color: $red;
        }
    }
}
</style>
