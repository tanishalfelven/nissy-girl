import { createMachine } from "xstate";

import Paint from "./paint.svelte";

export const paintMachine = createMachine({
	id : "paint",

	meta : {
		component : Paint,
	},
});
