<template>
    <div v-if="currentModal" class="app-modal">
        <div class="overlay" @click.self="close"></div>
        <component :is="currentModal.name" v-bind="currentModal.props" class="content"/>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import ScoreboardModal from './modals/ScoreboardModal';
import ObjectivesModal from './modals/ObjectivesModal';

export default {
    components: { ScoreboardModal, ObjectivesModal },

    computed: mapGetters(['currentModal']),

    mounted() {
        window.addEventListener('keydown', this.onKeyPress);
    },

    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyPress);
    },

    methods: {
        onKeyPress(event) {
            if (event.key === 'Escape') {
                this.close();
            }
        },

        close() {
            if (this.currentModal) {
                this.$store.commit('POP_MODAL');
            }
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.app-modal {
    z-index: 500;
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;

        background-color: rgba($bg-color, 0.75);
    }

    .content {
        z-index: 1;
        width: 42rem;
        overflow: hidden;
        border: $border;
        background-color: $bg-color;
    }
}
</style>
