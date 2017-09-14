<template>
<header class="app-header">
    <div class="app-header__game-state" @click="showObjectivesModal">
        <div class="app-header__score app-header__score--blue">{{ blueScore }} xxx</div>
        <div class="app-header__timer">00:00</div>
        <div class="app-header__score app-header__score--red">xxx {{ redScore }}</div>
    </div>
</header>
</template>


<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: Object.assign({},
        mapState([
            'stage',
        ]),
        mapGetters([
            'blueScore',
            'redScore',
        ]),
    ),

    methods: {
        showObjectivesModal() {
            this.$store.commit('SHOW_OBJECTIVES_MODAL');
        }
    }
};
</script>
