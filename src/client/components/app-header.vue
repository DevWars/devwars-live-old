<template>
<header class="app-header">
    <div class="app-header__game-state">
        <div class="app-header__score app-header__score--blue">{{ redScore }} xxx</div>
        <div class="app-header__timer">31:48</div>
        <div class="app-header__score app-header__score--red">xxx {{ blueScore }}</div>
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
            'redScore',
            'blueScore',
        ]),
    ),
};
</script>
