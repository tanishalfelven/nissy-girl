<script>
import css from "./menu.mcss";

const { children } = $props();
</script>

{@render children?.()}

<div class={css.platforms}>
	<div class={css.platform1}></div>
	<div class={css.platform2}></div>
	<div class={css.platform3}></div>
</div>
