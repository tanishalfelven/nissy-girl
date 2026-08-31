let sessionId;

export const track = (event, data = {}) => {
	try{
		if(!sessionId) {
			sessionId = crypto.randomUUID();
		}

		fetch("/analytics", {
			method : "POST",
			headers : {
				"content-type" : "application/json",
			},
			body : JSON.stringify({
				event,
				sessionId,
				...data,
			}),
			keepalive : true,
		});
	} catch (e) {
		/* eslint-disable-next-line no-console */
		console.warn("analytics failed", e);
	}
};
