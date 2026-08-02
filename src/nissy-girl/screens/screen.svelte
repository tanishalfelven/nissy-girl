<script module>
const snapToDevicePixel = (value) => {
	const dpr = window.devicePixelRatio;

	return Math.round(value * dpr) / dpr;
};
</script>
<script>
import css from "./screens.mcss";

let windowHeight = $state(0);
let windowWidth = $state(0);

// CURSED INCOMING
// this is necessary because when the screen gets stuck to bad pixel ratios it gets UGLY
// we can avoid jitter decently well by storing an idealized pixel value and using that everywhere
$effect(() => {
	if(windowHeight > 0 && windowWidth > 0) {
		// ideal height of screen is 28vh
		const idealHeight = windowHeight * 0.28;

		// screen is always 5:4
		const frameWidth = snapToDevicePixel(idealHeight * 1.25);

		document.documentElement.style.setProperty("--screen-width", `${frameWidth}px`);
		document.documentElement.style.setProperty("--screen-height", `${snapToDevicePixel(idealHeight)}px`);
	}
});

let { children } = $props();
</script>

<svelte:window
	bind:innerHeight={windowHeight}
	bind:innerWidth={windowWidth}
></svelte:window>

<div class={css.screenborder}>
	<div class={css.screencontainer}>
		{@render children?.()}
	</div>
</div>
