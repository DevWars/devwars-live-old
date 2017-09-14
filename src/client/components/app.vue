<template>
<div class="app">
    <router-view class="view"></router-view>
    <objectives-modal v-if="objectivesModalOpen"></objectives-modal>
</div>
</template>


<script>
import ObjectivesModal from './objectives-modal.vue';
import { mapState } from 'vuex';

export default {
    computed: mapState(['objectivesModalOpen']),

    components: {
        ObjectivesModal,
    },
};
</script>
