import { nissyGirlAudio, jumperAudio, paintAudio } from "./sfx.consts.js";

import { channelActive, overwriteChannel, stopChannel } from "./channels.js";

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

		const audioAsset = audioSet.get(id);

		audioAsset.src = await audioContext.decodeAudioData(
			await response.arrayBuffer(),
		);

		audioAsset.gainNode = audioContext.createGain();

		audioAsset.gainNode.gain.setValueAtTime(data?.gain ?? 1, 0);

		audioAsset.gainNode.connect(gainNode);

		assetChains.set(id, audioAsset.gainNode);
	}));
};

const makePlayer = (audioSet) => (id, options = {}, channel = false) => {
	if(!audioSet.has(id)) {
		throw new Error(`Tried to play nonexistent sound with id "${id}"`);
	}

	const audioAsset = audioSet.get(id);

	if(!audioAsset.src) {
		throw new Error(`No audio src for id ${id}`);
	}

	const audioContext = getAudioContext();

	const sfx = new AudioBufferSourceNode(audioContext, { buffer : audioAsset.src, ...options });

	if(channel) {
		overwriteChannel(channel, { sfx, gain : audioAsset.gainNode });
	}

	audioAsset.gainNode.gain.setValueAtTime(audioAsset.gain ?? 1, 0);
	gainNode.gain.setValueAtTime(volume.getGain(), 0);

	const assetChain = assetChains.get(id);

	sfx.connect(assetChain);
	sfx.start();

	return sfx;
};

const nissyGirlPlay = makePlayer(nissyGirlAudio);
const jumperPlay = makePlayer(jumperAudio);
const paintPlay = makePlayer(paintAudio);

const detune = (range = 500, steps = 10) => step(Math.random(), 1 / steps) * range;

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
		playJumperImpact : () => jumperPlay("impact-reaction", { detune : detune() }, "jumper-impact"),
		playJumperJump : () => jumperPlay("jump", { detune : detune() }, "jumper-jump"),
		playJumperBlast : () => jumperPlay("blast", { detune : detune() }),
		playLand : () => jumperPlay("land", {}),
		playCoin : () => jumperPlay("coin", {}),
		playWin : () => jumperPlay("win", {}),
	},

	paint : {
		load : () => loadAudioSet(paintAudio),

		playOink : () => paintPlay("oink", {}),
		playNavOink : () => paintPlay("navoink", { detune : 300 }),
		playOinkConfirm : () => paintPlay("oink", { detune : -200 }),
		playWinnie : () => paintPlay("winnie", {}),
		playWinnieZoom : (idx) => paintPlay("winnie", { detune : idx * 150 }),
		playGrunt : () => paintPlay("grunt", {}),
		playSplash : () => paintPlay("splash", {}),
		playPop : () => paintPlay("pop", {}),
		playScribble : () => {
			if(channelActive("scribble")) {
				return;
			}

			paintPlay("scribble", { detune : detune() - 200 }, "scribble");
		},
		playLineStart : () => paintPlay("line", { detune : detune(100) + 100 }, "line"),
		playLineEnd : () => paintPlay("line", { detune : detune(100) + 100 }, "lineend"),
		playLineContinue : () => {
			if(channelActive("line")) {
				return;
			}

			paintPlay("line", { detune : detune(100) - 200 }, "line");
		},
	},
};
