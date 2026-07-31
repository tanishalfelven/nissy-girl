import { mount } from "svelte";
import Index from "./index.svelte";

import "./nissy-girl/nissy-girl.machine.js";

import "./index.css";

const app = mount(Index, {
	target : document.getElementById("root"),
});

export default app;
