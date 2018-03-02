<template>
    <div class="watch-page">
        <AppHeader/>
        <GameView/>
    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import AppHeader from '../AppHeader';
import GameView from '../GameView';

export default {
    components: { AppHeader, GameView },

    computed: mapGetters(['userEditor']),

    watch: {
        userEditor() {
            if (!this.userEditor) {
                return;
            }

            const { team, language } = this.userEditor;
            this.$store.commit('PUSH_MODAL', {
                name: 'RedirectPlayerModal',
                props: { team, language },
            });
        },
    },
};
</script>


<style lang="scss" scoped>
.watch-page {
    display: flex;
    height: 100%;
    flex-flow: column nowrap;
}
</style>
