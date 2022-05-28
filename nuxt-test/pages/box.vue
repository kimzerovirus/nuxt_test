<template>
	<div ref="target" class="box"></div>
</template>

<script>
import Box from '@/3D/Box';
export default {
	mounted() {
		new Box(this.$refs.target);
	},
};
</script>

<style scoped>
.box {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
}
</style>
