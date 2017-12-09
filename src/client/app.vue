<template>
<div class="app">
    <router-view class="view"></router-view>
    <component :is="currentModal"></component>
</div>
</template>


<script>
import ObjectivesModal from './components/objectives-modal.vue';
import { mapState } from 'vuex';

export default {
    computed: mapState(['currentModal']),

    components: {
        'OBJECTIVES_MODAL': ObjectivesModal,
    },
};
</script>
