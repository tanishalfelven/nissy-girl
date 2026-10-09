<script>
import { handleEvent, touch } from "$util/touch-action.svelte.js";
import { noopFalseFunction } from "$util/noop.js";

import { gestureActor } from "$nissy-girl/gesture.machine.js";
import { gesture } from "$nissy-girl/gesture.viewmodel.svelte.js";

import { cartridges } from "$nissy-girl/device/cartridge/cartridge.viewmodel.svelte.js";

import { manualContentPages } from "./manual.data.js";
import { manual } from "./manual.viewmodel.svelte.js";

import Page from "./page.svelte";

import css from "./manual.mcss";

const PAGE_WIDTH = parseFloat(css.$values.objectwidth);
const PAGE_HEIGHT = parseFloat(css.$values.objectheight);

let foldPlaneEl = $state(false);
let stationaryPageEl = $state(false);
let flapPageEl = $state(false);

const LEGAL_CURL_RADIUS = 1;

$effect(() => {
	if(!foldPlaneEl || !stationaryPageEl || !flapPageEl) {
		return;
	}

	const originX = manual.dragX < 0 ? PAGE_WIDTH : 0;
	const originY = manual.dragY < 0 ? PAGE_HEIGHT : 0;

	// 1 drag space unit === 1 page width
	// 1 page width === the radius of The Legal Circle!

	// ratio of requested curl to The Legal Circle
	// <= 1 is legal; > 1 must be scaled back to the boundary
	const radialRatio =
		(manual.dragX ** 2 + manual.dragY ** 2)
		/ (2 * LEGAL_CURL_RADIUS * Math.abs(manual.dragX));

	// scale illegal (>1) back to The Circle
	const dragScale = 1 / Math.max(1, radialRatio);

	// convert to physical space and find scale
	const foldScale = dragScale * PAGE_WIDTH / 2;

	// fold lies at the midpoint of the legal drag vector
	const foldX = originX + manual.dragX * foldScale;
	const foldY = originY + manual.dragY * foldScale;

	// fold angle is perpendicular to drag
	const foldAngle = Math.atan2(manual.dragX, -manual.dragY);

	const foldTransform = `translate(${foldX}rem, ${foldY}rem) rotate(${foldAngle}rad)`;

	const pageTransform = `rotate(${-foldAngle}rad) translate(${-foldX}rem, ${-foldY}rem)`;

	foldPlaneEl.style.transform = foldTransform;
	stationaryPageEl.style.transform = pageTransform;
	flapPageEl.style.transform = `${pageTransform} translateX(${PAGE_WIDTH}rem) scaleX(-1)`;
});
</script>

<div
	class={css.manual}
	data-hide={cartridges.isVisible}
	data-background={gesture.isDeviceFocused}
	data-animate={gesture.shouldAnimate}
	use:touch={{
		start : () => {
			if(gesture.isDeviceFocused) {
				gestureActor.send({ type : "REQUEST_MANUAL" });

				return;
			}
		},

		move : noopFalseFunction,
		end : noopFalseFunction,

		handleEvent : (e) => {
			if(gesture.isDeviceFocused) {
				handleEvent(e);
			}
		},
	}}
>
	{#if manualContentPages[manual.curlPageIndex]}
		{@const curlPage = manualContentPages[manual.curlPageIndex]}

		<div
			class={css.foldplane}
			style:z-index={manualContentPages.length + 1}
			bind:this={foldPlaneEl}
		>
			<!-- TODO baked assumption for right turn only -->
			{#if manual.hasNextpage()}
				{@const curlNextPage = manualContentPages[manual.curlPageIndex + 1]}

				<div class={css.foldpage} data-stationary="true">
					<Page
						isFolding={true}
						index={manual.curlPageIndex + 1}
						id={curlNextPage.id}
						side={curlNextPage.side}
						bind:element={stationaryPageEl}
					/>
				</div>
			{/if}

			<div class={css.foldpage} data-folded="true">
				<Page
					isFolding={true}
					index={manual.curlPageIndex}
					id={curlPage.id}
					side={curlPage.side}
					bind:element={flapPageEl}
				/>
			</div>
		</div>
	{/if}

	<div class={css.manualpages}>
		{#each manualContentPages as { id, side }, index}
			<Page {id} {index} {side} />
		{/each}
	</div>
</div>
