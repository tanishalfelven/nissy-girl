import { nissyGirlAudio, jumperAudio } from "./sfx.consts.js";

import { overwriteChannel, stopChannel } from "./channels.js";

import { volume } from "./volume.svelte.js";
import { step } from "$util/math.js";

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

const loadAudioSet = async (audioSet) => {
	const audioContext = getAudioContext();

	return await Promise.all([ ...audioSet ].map(async ([ id, data ]) => {
		const response = await fetch(data.url);

		audioSet.get(id).src = await audioContext.decodeAudioData(
			await response.arrayBuffer(),
		);

		const assetGain = audioContext.createGain();

		assetGain.gain.setValueAtTime(data?.gain ?? 1, 0);

		assetGain.connect(gainNode);

		assetChains.set(id, assetGain);
	}));
};

const makePlayer = (audioSet) => (id, options = {}, channel = false) => {
	if(!audioSet.has(id)) {
		throw new Error(`Tried to play nonexistent sound with id "${id}"`);
	}

	const { src } = audioSet.get(id);

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

	return sfx;
};

const nissyGirlPlay = makePlayer(nissyGirlAudio);
const jumperPlay = makePlayer(jumperAudio);

export const audio = {
	playVolumeKnob : () => nissyGirlPlay("volumeWheel", { detune : volume.value * -30 + Math.random() * 15 }, "volume"),
	playPowerToggle : () => nissyGirlPlay("powerToggle"),
	playCartridgeScrape : () => nissyGirlPlay("scrape", {}, "scrape"),
	playCartridgeInsert : () => nissyGirlPlay("cartridgeInsert", {}, "cartridge"),
	playCartridgeRemove : () => nissyGirlPlay("cartridgeRemove", {}, "cartridge"),
	playBootJingle : () => nissyGirlPlay("nissyGirlBoot", {}, "boot"),
	stopBootJingle : () => stopChannel("boot"),

	loadNissyGirlSfx : () => loadAudioSet(nissyGirlAudio),

	jumper : {
		load : () => loadAudioSet(jumperAudio),

		playUIBack : () => jumperPlay("back", {}),
		playUIMove : () => jumperPlay("button", {}),
		playUIConfirm : () => jumperPlay("confirm", {}),
		playUIPause : () => jumperPlay("pause", {}),
		playUITick : () => jumperPlay("tick", {}),
		playCountBeep : () => jumperPlay("beep", {}),
		playFinishCountBeep : () => jumperPlay("beep-finish", {}),
		playJumperImpact : () => jumperPlay("impact-reaction", { detune : Math.random() * 100 }, "jumper-impact"),
		playJumperJump : () => jumperPlay("jump", { detune : step(Math.random(), 0.10) * 100 }, "jumper-jump"),
		playJumperBlast : () => jumperPlay("blast", { detune : step(Math.random(), 0.10) * 100 }),
		playCoin : () => jumperPlay("coin", {}),
		playWin : () => jumperPlay("win", {}),
	},
};
