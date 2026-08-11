import { nissyGirlAudio } from "./sfx.consts.js";

import { clamp } from "$util/math.js";

let _audioContext = false;
let gainNode = false;
let volume = $state(0.65);

// need per asset gain, this is fine atm
const getGain = () => volume * 0.25;

const channels = new Map();

const overwriteChannel = (channel, node) => {
	const previousSound = channels.get(channel);

	if(previousSound) {
		previousSound.stop();
	}

	channels.set(channel, node);
};

const getAudioContext = () => {
	if(!_audioContext) {
		_audioContext = new AudioContext();
	}

	if(_audioContext.state === "suspended") {
		_audioContext.resume();
	}

	if(!gainNode) {
		gainNode = _audioContext.createGain({ value : getGain() });
		gainNode.connect(_audioContext.destination);
	}

	return _audioContext;
};

const play = (id, options = {}, channel = false) => {
	// disable everything but volumewheel. Not happy with them yet.
	if(id !== "volumeWheel") {
		return;
	}

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

	gainNode.gain.value = getGain();

	sfx.connect(gainNode);
	sfx.start();
};

const loadNissyGirlSfx = async () => {
	const audioContext = getAudioContext();

	return await Promise.all([ ...nissyGirlAudio ].map(async ([ id, data ]) => {
		const response = await fetch(data.url);

		nissyGirlAudio.get(id).src = await audioContext.decodeAudioData(
			await response.arrayBuffer(),
		);
	}));
};

export const audio = {
	get volume() {
		return volume;
	},

	setVolume(newVolume) {
		volume = clamp(newVolume, 0, 1);
	},

	playVolumeKnob : () => play("volumeWheel", { detune : audio.volume * 30 + Math.random() * 15 }, "volume"),
	playPowerOn : () => play("powerOn", { playbackRate : 1.075 }, "power"),
	playPowerOff : () => play("powerOff", { playbackRate : 1.075 }, "power"),
	playCartridgeInsert : () => play("cartridgeInsert", {}, "cartridge"),
	playCartridgeRemove : () => play("cartridgeRemove", {}, "cartridge"),

	loadNissyGirlSfx,
};
