export const createDeferred = () => {
	let resolve;
	let reject; ;

	const deferred = new Promise((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	deferred.resolve = resolve;
	deferred.reject = reject;

	return deferred;
};
