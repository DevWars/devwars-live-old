<template>
    <div class="ConfirmModal">
        <h1 class="title">{{ title }}</h1>
        <slot></slot>
        <div class="actions">
            <button @click="onConfirm">{{ buttonText }}</button>
            <button class="secondary" @click="onCancel">Cancel</button>
        </div>
    </div>
</template>


<script>
export default {
    props: {
        title: { type: String, default: 'Notice' },
        buttonText: { type: String, default: 'Confirm' },
    },

    methods: {
        onConfirm() {
            this.$store.commit('POP_MODAL');
            this.$emit('confirm');
        },

        onCancel() {
            this.$store.commit('POP_MODAL');
        },
    },
};
</script>


<style lang="scss" scoped>
@import 'settings.scss';
.ConfirmModal {
    padding: 3.5rem;
    text-align: center;
    line-height: 1.4;

    .title {
        margin: 0;
        margin-bottom: 2rem;
        text-transform: uppercase;
        font-size: 2.5rem;
        font-weight: 300;
    }

    .blue {
        color: $blue;
    }

    .red {
        color: $red;
    }

    .actions {
        display: flex;
        margin-top: 2rem;
        justify-content: center;

        button {
            margin-right: 0.5rem;
            padding: 0 0.75rem;
            height: 2.5rem;

            &.secondary:not(:hover) {
                border-color: transparent;
            }
        }
    }
}
</style>
