export const channels = new Map();

const FADE_TIME = 0.03;

export const stopChannel = (channel) => {
	const channelSound = channels.get(channel);

	if(!channelSound || !channelSound.sfx) {
		return;
	}

	if(!channelSound.finished) {
		const now = channelSound.sfx.context.currentTime;

		channelSound.gain.gain.cancelScheduledValues(now);
		channelSound.gain.gain.setValueAtTime(channelSound.gain.gain.value, now);
		channelSound.gain.gain.linearRampToValueAtTime(0, now + FADE_TIME);

		channelSound.sfx.stop(now + FADE_TIME);
	}

	channels.delete(channel);
};

export const channelActive = (channel) => {
	const channelSound = channels.get(channel);

	if(!channelSound) {
		return false;
	}

	return !channelSound.finished;
};

export const overwriteChannel = (channel, channelSound) => {
	stopChannel(channel);

	channels.set(channel, {
		...channelSound,
		finished : false,
	});

	channelSound.sfx.onended = () => {
		const newChannelSound = channels.get(channel);

		if(!newChannelSound) {
			return;
		}

		if(newChannelSound.sfx === channelSound.sfx && !newChannelSound.finished) {
			newChannelSound.finished = true;
		}
	};
};
