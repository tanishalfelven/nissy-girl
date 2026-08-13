import { nissyGirlAudio } from "./sfx.consts.js";

import { overwriteChannel, stopChannel } from "./channels.js";

import { volume } from "./volume.svelte.js";

let _audioContext = false;
let gainNode = false;

const assetChains = new Map();

const getAudioContext = () => {
	if(!_audioContext) {
		_audioContext = new AudioContext();
	}

	if(_audioContext.state === "suspended") {
		_audioContext.resume();
	}

	if(!gainNode) {
		gainNode = _audioContext.createGain();
		gainNode.gain.setValueAtTime(volume.getGain(), 0);
		gainNode.connect(_audioContext.destination);
	}

	return _audioContext;
};

const loadNissyGirlSfx = async () => {
	const audioContext = getAudioContext();

	return await Promise.all([ ...nissyGirlAudio ].map(async ([ id, data ]) => {
		const response = await fetch(data.url);

		nissyGirlAudio.get(id).src = await audioContext.decodeAudioData(
			await response.arrayBuffer(),
		);

		const assetGain = audioContext.createGain();

		assetGain.gain.setValueAtTime(data?.gain ?? 1, 0);

		assetGain.connect(gainNode);

		assetChains.set(id, assetGain);
	}));
};

const play = (id, options = {}, channel = false) => {
	if(!nissyGirlAudio.has(id)) {
		throw new Error(`Tried to play nonexistent sound with id "${id}"`);
	}

	const { src } = nissyGirlAudio.get(id);

	if(!src) {
		throw new Error(`No audio src for id ${id}`);
	}

	const audioContext = getAudioContext();

	const sfx = new AudioBufferSourceNode(audioContext, { buffer : src, ...options });

	if(channel) {
		overwriteChannel(channel, sfx);
	}

	gainNode.gain.setValueAtTime(volume.getGain(), 0);

	const assetChain = assetChains.get(id);

	sfx.connect(assetChain);
	sfx.start();
};

export const audio = {
	playVolumeKnob : () => play("volumeWheel", { detune : volume.value * -30 + Math.random() * 15 }, "volume"),
	playPowerToggle : () => play("powerToggle"),
	playCartridgeScrape : () => play("scrape", {}, "scrape"),
	playCartridgeInsert : () => play("cartridgeInsert", {}, "cartridge"),
	playCartridgeRemove : () => play("cartridgeRemove", {}, "cartridge"),
	playBootJingle : () => play("nissyGirlBoot", {}, "boot"),
	stopBootJingle : () => stopChannel("boot"),

	loadNissyGirlSfx,
};
