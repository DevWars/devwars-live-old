<template>
    <div class="app">
        <router-view/>
        <AppModal/>
    </div>
</template>


<script>
import AppModal from './components/AppModal';

export default {
    components: { AppModal },
};
</script>


<style lang="scss">
@import './styles/variables';
@import './styles/animations';
@import './styles/base';
@import './styles/material-design-icons';
</style>


<style lang="scss" scoped>
.app {
    position: relative;
    height: 100vh;
    overflow: hidden;
}
</style>
