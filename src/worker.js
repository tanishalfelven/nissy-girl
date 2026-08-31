export default{
	async fetch(request, env) {
		const url = new URL(request.url);

		if(url.pathname === "/analytics" && request.method === "POST") {
			const data = await request.json();

			env.ANALYTICS.writeDataPoint({
				blobs : [
					data.sessionId ?? "",
					data.event ?? "",
					data.state ?? "",
				],
			});

			return new Response(null, { status : 204 });
		}

		return env.ASSETS.fetch(request);
	},
};
