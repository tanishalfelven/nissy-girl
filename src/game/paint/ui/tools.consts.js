import PencilPng from "./assets/pencil.png";
import PaperPng from "./assets/paper.png";
import PaintBucketPng from "./assets/paint-bucket.png";
import LinePng from "./assets/line.png";
import PencilNoOutlinePng from "./assets/pencil-nooutline.png";
import PaintBucketNoOutlinePng from "./assets/paint-bucket-nooutline.png";
import LineNoOutlinePng from "./assets/line-nooutline.png";

export const PENCIL = "pencil";
export const BUCKET = "bucket";
export const LINE = "line";
export const NEW_ARTBOARD = "new-artboard";

export const TOOLS = new Map([
	[ PENCIL, { lined : PencilPng, unlined : PencilNoOutlinePng }],
	[ LINE, { lined : LinePng, unlined : LineNoOutlinePng }],
	[ BUCKET, { lined : PaintBucketPng, unlined : PaintBucketNoOutlinePng }],
	[ NEW_ARTBOARD, { unlined : PaperPng }],
]);
