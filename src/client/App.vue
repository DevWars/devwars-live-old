<template>
    <div class="App">
        <router-view/>
        <TheModal/>
    </div>
</template>


<script>
import TheModal from './components/TheModal';

export default {
    components: { TheModal },
};
</script>


<style lang="scss">
@import 'settings.scss';
@import './styles/base';
@import './styles/animations';
@import './styles/vendor/materialDesignIcons';
</style>


<style lang="scss" scoped>
.App {
    position: relative;
    height: 100vh;
    overflow: hidden;
}
</style>
