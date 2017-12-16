<template>
    <div v-if="currentModal" @click.self="close" class="app-modal">
        <component :is="currentModal" class="container"/>
    </div>
</template>


<script>
import { mapState } from 'vuex';
import ScoreboardModal from './ScoreboardModal';

export default {
    components: {
        'ScoreboardModal': ScoreboardModal,
    },

    computed: mapState(['currentModal']),

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
                this.$store.commit('CLOSE_MODAL');
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
    cursor: pointer;

    background-color: rgba($bg-color, 0.75);

    .container {
        overflow: hidden;
        cursor: default;
        border: $border;
        background-color: $bg-color;
    }
}
</style>
