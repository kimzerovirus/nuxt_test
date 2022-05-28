<template>
	<div ref="target" class="box"></div>
</template>

<script>
import Text from '@/3D/Text';
export default {
	data() {
		return {
			three: null,
		};
	},
	mounted() {
		this.three = new Text(this.$refs.target);
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
