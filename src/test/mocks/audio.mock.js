import { spy } from "nanospy";

import { MS } from "$util/time-string.js";

// Browser half: replaces the Web Audio surface used by src/nissy-girl/sound.
// Runs as a page init script, so it may only reference browser globals and its argument.
const installAudio = ({ MS }) => {
	const report = (type, payload) => window.reportAudio(type, payload);

	// Remember which file each fetched buffer came from, so played sounds are identifiable.
	const urls = new WeakMap();
	const arrayBuffer = Response.prototype.arrayBuffer;

	Response.prototype.arrayBuffer = async function arrayBufferWithUrl() {
		const data = await arrayBuffer.call(this);

		urls.set(data, this.url);

		return data;
	};

	class AudioParam {
		constructor(value) {
			this.value = value;
		}

		setValueAtTime(value) {
			this.value = value;

			return this;
		}

		linearRampToValueAtTime(value) {
			this.value = value;

			return this;
		}

		cancelScheduledValues() {
			return this;
		}
	}

	class AudioNode {
		constructor(context) {
			this.context = context;
		}

		connect(node) {
			return node;
		}

		disconnect() {}
	}

	class GainNode extends AudioNode {
		gain = new AudioParam(1);
	}

	class AudioContext {
		state = "running";
		destination = new AudioNode(this);

		constructor() {
			report("context");
		}

		get currentTime() {
			return performance.now() / MS;
		}

		resume() {
			return Promise.resolve();
		}

		createGain() {
			return new GainNode(this);
		}

		decodeAudioData(data) {
			const url = urls.get(data) ?? "";

			report("decode", { url });

			// Long enough to overlap gestures, short enough to finish under the test clock.
			return Promise.resolve({ duration : 0.5, url });
		}
	}

	class AudioBufferSourceNode extends AudioNode {
		onended = null;
		#detune;
		#ended = false;

		constructor(context, { buffer, detune = 0 }) {
			super(context);

			this.buffer = buffer;
			this.#detune = detune;
		}

		start() {
			report("start", { url : this.buffer.url, detune : this.#detune });
			setTimeout(() => this.#end(), this.buffer.duration * MS);
		}

		stop(when = 0) {
			report("stop");
			setTimeout(() => this.#end(), Math.max(0, when - this.context.currentTime) * MS);
		}

		#end() {
			if(this.#ended) {
				return;
			}

			this.#ended = true;

			this.onended?.();
		}
	}

	window.AudioContext = AudioContext;
	window.AudioBufferSourceNode = AudioBufferSourceNode;
};

/**
 * Test-only Web Audio. Create one per test and apply it to that page before
 * navigating; the nanospy spies record what the page did with audio. `decode`
 * and `start` calls carry the source file `url` of the sound.
 * @returns {object} spies (context, decode, start, stop) and apply(page)
 */
export const createAudioMock = () => {
	const mock = {
		context : spy(),
		decode : spy(),
		start : spy(),
		stop : spy(),

		async apply(page) {
			await page.exposeBinding("reportAudio", (_, type, payload) => {
				mock[type](payload);
			});
			await page.addInitScript(installAudio, { MS });
		},
	};

	return mock;
};
