<template>
    <div class="play-page">
        <div class="panel editor">
            <AppHeader>
                <PlaylistCheckIcon
                    slot="left"
                    :class="`objectives-modal-icon ${team}`"
                    @click.native="openObjectivesModal"
                />
            </AppHeader>
            <EditorPlayer
                v-if="playerEditor"
                :key="playerEditor.namespace"
                :namespace="playerEditor.namespace"
                :team="playerEditor.team"
                :language="playerEditor.language"
                :editable="true"
                :collapsible="false"
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
import PlaylistCheckIcon from 'vue-material-design-icons/checkbox-multiple-marked-outline';
import AppHeader from '../AppHeader';
import EditorGroup from '../EditorGroup';
import EditorPlayer from '../EditorPlayer';
import WebViewer from '../WebViewer';

export default {
    components: {
        AppHeader,
        EditorGroup,
        EditorPlayer,
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
@import '../../styles/variables';

.play-page {
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

        .web-viewer {
            flex: 1 1 100%;
        }

        .editor-group {
            flex: 1 1 80%;
            border-top: $border;
        }
    }

    .objectives-modal-icon {
        margin: 0 1rem;
        font-size: 1.5rem;
        cursor: pointer;

        &.blue {
            color: $blue-team-color;
        }
        &.red {
            color: $red-team-color;
        }
    }
}
</style>
