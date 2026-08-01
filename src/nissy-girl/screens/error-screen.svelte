<script>
const error =
	`ERROR UNRECOVERABLE! <b>[1025] CARTRIDGE REMOVE</b> cartridge removal during play is not safe for cartridges. please keep console out of reach of children while playing. in the future, please be more considerate. it would be a shame if a cartridge was damaged due to your lack of care. if you are experiencing issues with your game cartridge please contact nissy corp™
🍄`;
</script>

<div class="error-screen">{@html error}</div>

<style>
.error-screen {
	width: 100%;
	height: 100%;

	background-color: #000331;

	color: #afa;
	white-space: pre-wrap;
	font-size: calc(6.6 * var(--1px));
	font-family:  monospace;

	word-break: break-all;

	padding: calc(0.3 * var(--1px));
}
</style>
