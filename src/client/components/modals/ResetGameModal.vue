<template>
    <ConfirmModal title="Warning" buttonText="Reset" @confirm="onConfirm">
        <p>Are you sure you want to reset the game?</p>
        <p>
            If the game has finished, ensure to complete it within the
            moderation panel first to store the results!
        </p>
    </ConfirmModal>
</template>

<script>
import ConfirmModal from './ConfirmModal';
import socket from '../../services/socket';

export default {
    components: { ConfirmModal },

    methods: {
        onConfirm() {
            socket.emit('reset-game');
        },
    },
};
</script>
