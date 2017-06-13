<template>
<div class="site-viewer">
	<button class="site-viewer__reload" @click="reload">Reload</button>
	<iframe ref="iframe" class="site-viewer__iframe" :src="url" frameborder="0"></iframe>
</div>
</template>


<script>
export default {
	props: ['url'],

	methods: {
		reload() {
			this.$refs.iframe.contentDocument.location.reload();
		},
	},
};
</script>
