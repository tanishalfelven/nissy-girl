<script>
import StartupScreenGif from "./assets/startup-screen.gif?no-inline";

import css from "./screens.mcss";

const time = Date.now();
</script>

<img src={`${StartupScreenGif}?t=${time}`} alt="startup gif" class={css.startupscreen} />
