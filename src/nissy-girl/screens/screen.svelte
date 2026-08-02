<script>
import css from "./screens.mcss";

let { children } = $props();
</script>

<div class={css.screenborder}>
	<div class={css.screencontainer}>
		{@render children?.()}
	</div>
</div>
