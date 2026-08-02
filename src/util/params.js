export const getParam = (id) => {
	let params = new URLSearchParams(document.location.search);

	return params.get(id);
};

export const hasParam = (id) => {
	let params = new URLSearchParams(document.location.search);

	return params.has(id);
};
