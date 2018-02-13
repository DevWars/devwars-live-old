<template>
    <div class="countdown-timer">
        <span :class="warn ? 'warn' : ''">{{ timer }}</span>
    </div>
</template>


<script>
export default {
    props: ['end', 'warnTime'],

    data() {
        return {
            now: Date.now(),
            interval: null,
        };
    },

    computed: {
        timer() {
            if (this.now >= this.end) {
                return '00:00';
            }

            const seconds = this.seconds.toString().padStart(2, '0');
            const minutes = this.minutes.toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        },

        seconds() {
            return Math.trunc((this.end - this.now) / 1000) % 60;
        },

        minutes() {
            return Math.trunc((this.end - this.now) / 1000 / 60);
        },

        warn() {
            if (typeof this.warnTime === 'number') {
                return (this.end - this.now) < this.warnTime;
            }
        },
    },

    mounted() {
        setTimeout(() => {
            if (!this._isDestroyed) {
                this.onTick();
                this.interval = setInterval(this.onTick, 1000);
            }
        }, 1000 - (Date.now() % 1000));
    },

    beforeDestroy() {
        clearInterval(this.interval);
    },

    methods: {
        onTick() {
            this.now = Date.now();
        },
    },
};
</script>


<style lang="scss" scoped>
@import '../styles/variables';

.countdown-timer {
    .warn {
        color: $warrning-color;
    }
}
</style>
