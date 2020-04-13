<template>
    <ConfirmModal title="Warning" buttonText="Reset" @confirm="onConfirm">
        <p>Are you sure you want to reapply the editor templates?</p>
        <p>This will remove all existing editor text.</p>
    </ConfirmModal>
</template>

<script>
import ConfirmModal from './ConfirmModal';
import socket from '../../services/socket';

export default {
    components: { ConfirmModal },

    methods: {
        onConfirm() {
            socket.emit('reapply-game-templates');
        },
    },
};
</script>
