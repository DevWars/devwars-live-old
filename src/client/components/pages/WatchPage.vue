<template>
    <div class="WatchPage">
        <TheHeader/>
        <GameView/>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import TheHeader from '../TheHeader';
import GameView from '../GameView';

export default {
    components: { TheHeader, GameView },

    data() {
        return { modalShown: false };
    },

    computed: mapGetters(['userEditor', 'currentModal']),

    watch: {
        userEditor() {
            if (!this.userEditor || this.modalShown) {
                return;
            }

            const { team, language } = this.userEditor;
            this.$store.commit('PUSH_MODAL', {
                name: 'RedirectPlayerModal',
                props: { team, language },
            });

            this.modalShown = true;
        },
    },
};
</script>


<style lang="scss" scoped>
.WatchPage {
    display: flex;
    height: 100%;
    flex-flow: column nowrap;
}
</style>
