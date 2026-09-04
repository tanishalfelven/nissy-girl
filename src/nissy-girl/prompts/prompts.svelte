<script module>
import { Actor, fromCallback } from "xstate";
import { fade } from "svelte/transition";

import {
	BUTTON_B,
	BUTTON_A,
	DPAD_DOWN,
	BUTTON_START,
	BUTTON_SELECT,
} from "$game/shared/input.consts.js";

export const ROTATE = "rotate";
export const CARTRIDGE_INSERT = "insert";
export const CARTRIDGE_EJECT = "eject";
export const POWER_ON = "poweron";
export const POWER_OFF = "poweroff";
export const POWER_CYCLE = "powercycle";
export const MUSHROOM = "mushroom";

export const DPAD = "dpad";
export const DPAD_HORZ = "dpadhorz";
export const DPAD_VERT = "dpadvert";
export const DPAD_FULL = "dpadfull";

export {
	DPAD_DOWN,
	BUTTON_A,
	BUTTON_B,
	BUTTON_START,
	BUTTON_SELECT,
};

const PROMPT_SOURCE = new Map([
	[ ROTATE, { text : "view cartridges", className : "rotate" }],
	[ POWER_ON, { text : "power on", className : "poweron" }],
	[ POWER_OFF, { text : "power off", className : "poweroff" }],
	[ CARTRIDGE_INSERT, { text : "insert cartridge", className : "insert" }],
	[ CARTRIDGE_EJECT, { text : "eject cartridge", className : "eject" }],

	[ MUSHROOM, { className : "mushroom" }],

	// game based inputs dont have default text
	[ DPAD, { className : "dpad" }],
	[ DPAD_DOWN, { className : "dpaddown" }],
	[ DPAD_HORZ, { className : "dpadhorz" }],
	[ DPAD_VERT, { className : "dpadvert" }],
	[ DPAD_FULL, { className : "dpadfull" }],
	[ BUTTON_A, { className : "buttona" }],
	[ BUTTON_B, { className : "buttonb" }],
	[ BUTTON_SELECT, { className : "buttonselect" }],
	[ BUTTON_START, { className : "buttonstart" }],
]);

let promptLayers = $state([]);
const activeLayer = $derived.by(() => {
	if(promptLayers && promptLayers.length) {
		return promptLayers.at(-1);
	}

	return false;
});

const get = (thing) => {
	if(typeof thing === "function") {
		return thing();
	}

	return thing;
};

/**
 * @param {string} layer descriptive layer name
 * @param {Map<string, { display : () => boolean, prompt : boolean, disable : boolean }>} promptLayerData map of prompt ids with runes dictating display state
 * @returns {Actor}
 */
export const invokePromptLayer = (layer, promptLayerData) => {
	if(typeof layer !== "string") {
		throw new Error("Must provide id for prompt layer");
	}

	return {
		id : layer,
		src : fromCallback(() => {
			const promptLayerMap = $state(new Map(get(promptLayerData)));

			promptLayers.push(promptLayerMap);

			return () => {
				const layerIndex = promptLayers.findIndex((promptLayer) => promptLayer === promptLayerMap);

				if(layerIndex === -1) {
					return;
				}

				promptLayers.splice(layerIndex, 1);
			};
		}),
	};
};
</script>
<script>
import css from "./prompts.mcss";
</script>

<div class={css.prompts}>
	{#if activeLayer}
		{#each activeLayer as [ promptId, { display = true, prompt = false, disable = false }], index}
			{#if get(display)}
				{@const { text, className } = PROMPT_SOURCE.get(promptId)}
				{@const displayText = get(prompt) || text || ""}

				{#key (`${promptId}-${index}`)}
					<div class={css[className]} data-disabled={get(disable)} in:fade={{ duration : 90 }}>
						<div class={css.text}>
							{displayText}
						</div>
					</div>
				{/key}
			{/if}
		{/each}
	{/if}
</div>
