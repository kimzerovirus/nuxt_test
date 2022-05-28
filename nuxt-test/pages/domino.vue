<template>
	<div ref="target" class="domino"></div>
</template>

<script>
import Domino from '@/3D/Domino';
export default {
	mounted() {
		new Domino(this.$refs.target);
	},
};
</script>

<style scoped>
.domino {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
}
</style>
