<template>
    <div class="app">
        <router-view></router-view>
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
@import './styles/material-design-icons';
@import './styles/variables';
@import './styles/animations';
@import './styles/base';
</style>


<style lang="scss" scoped>
.app {
    position: relative;
    height: 100vh;
    overflow: hidden;
}
</style>
