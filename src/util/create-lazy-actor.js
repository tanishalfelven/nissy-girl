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

			if(initializeValue || !fromCallbackInput) {
				return;
			}

			initializeValue = value;

			stop = start(initializeValue, fromCallbackInput);
		},
	};
};
