import { fromCallback } from "xstate";

/**
 * For globally exposed actors so other parts of the codebase can grab reference directly
 * @param {object} options options obj
 * @param {string} options.id invoke id
 * @param {() => () => void} options.start setup/teardown
 * @returns {import("xstate").AnyInvokeConfig} invokeable xstate actor
 */
export const createLazyActor = ({
	id,
	start,
}) => {
	let initializeValue = false;
	let fromCallbackInput = false;
	let actorRef = false;
	let stop = false;

	return {
		id,
		src : fromCallback((callbackInput) => {
			if(fromCallbackInput || actorRef) {
				throw new Error(`Actor "${id}" is already active.`);
			}

			fromCallbackInput = callbackInput;
			actorRef = fromCallbackInput.self;

			return () => {
				initializeValue = false;
				fromCallbackInput = false;
				actorRef = false;

				stop?.();
			};
		}),

		send(event) {
			if(actorRef === false) {
				return false;
			}

			actorRef.send(event);
		},

		getIsActive() {
			return fromCallbackInput !== false;
		},

		isInitialized() {
			return initializeValue !== false;
		},

		initialize(value) {
			if(!value) {
				throw new Error(`Can't initialize actor with value "${value}"`);
			}

			// TODO it is an ordering assumption that initialize is always called after fromCallbackInput
			// If someone started expecting otherwise, that might suck for them!
			if(initializeValue || !fromCallbackInput) {
				if(import.meta.env.DEV) {
					/* eslint-disable-next-line no-console */
					console.warn(`[createLazyActor] initialize called before invoke, throwing away (catastrophic failure, ${id} may never initialize.`);

					return;
				}
			}

			initializeValue = value;

			stop = start(initializeValue, fromCallbackInput);
		},
	};
};
