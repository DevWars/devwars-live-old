<template>
<div class="modal__overlay" @click="close">
    <div class="modal" @click.stop>
        <slot></slot>
    </div>
</div>
</template>


<script>
import { mapState, mapGetters } from 'vuex';

export default {
    methods: {
        close() {
            this.$store.commit('CLOSE_MODAL');
        },
    },
};
</script>
