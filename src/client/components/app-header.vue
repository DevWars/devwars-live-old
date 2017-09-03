<template>
<header class="app-header">
    <div class="app-header__game-state">
        <div class="app-header__score app-header__score--blue">{{ blueScore }} xxx</div>
        <div class="app-header__timer">31:48</div>
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
};
</script>
