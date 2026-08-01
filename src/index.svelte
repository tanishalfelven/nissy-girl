<script>
import Self from "./index.svelte";

import { statechart } from "./util/statechart-actors.svelte.js";

let { children = statechart.getTree(), depth = 0 } = $props();
</script>

{#each children as { machine, path, component : Component, props, children : _children } (`${machine}-${path}-${depth}`)}
	<Component {...props}>
		{#if _children?.length}
			<Self children={_children} depth={depth + 1} />
		{/if}
	</Component>
{/each}
