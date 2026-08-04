let params;

const getParams = () => {
	if(!params) {
		params = new URLSearchParams(document.location.search);
	}

	return params;
};

export const getParam = (id) => getParams().get(id);

export const hasParam = (id) => getParams().get(id);
