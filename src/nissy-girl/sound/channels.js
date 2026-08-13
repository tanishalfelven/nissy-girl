export const channels = new Map();

export const stopChannel = (channel) => {
	const previousSound = channels.get(channel);

	if(previousSound) {
		previousSound.stop();
	}

	channels.delete(channel);
};

export const overwriteChannel = (channel, node) => {
	stopChannel(channel);

	channels.set(channel, node);
};
