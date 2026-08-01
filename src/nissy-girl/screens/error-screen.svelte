<script>
import css from "./screens.mcss";

const error =
	`ERROR UNRECOVERABLE! <b>[1025] CARTRIDGE REMOVE</b> cartridge removal during play is not safe for cartridges. please keep console out of reach of children while playing. in the future, please be more considerate. it would be a shame if a cartridge was damaged due to your lack of care. if you are experiencing issues with your game cartridge please contact nissy corp™
🍄`;
</script>

<div class={css.errorscreen}>{@html error}</div>
