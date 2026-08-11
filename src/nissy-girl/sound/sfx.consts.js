import volumeWheel from "$nissy-girl/assets/sound/volume-wheel.wav";
import powerOn from "$nissy-girl/assets/sound/power-on.wav";
import powerOff from "$nissy-girl/assets/sound/power-off.wav";
import cartridgeInsert from "$nissy-girl/assets/sound/cartridge-insert.wav";
import cartridgeRemove from "$nissy-girl/assets/sound/cartridge-remove.wav";

export const nissyGirlAudio = new Map([
	[ "volumeWheel", { url : volumeWheel }],
	[ "powerOn", { url : powerOn }],
	[ "powerOff", { url : powerOff }],
	[ "cartridgeInsert", { url : cartridgeInsert }],
	[ "cartridgeRemove", { url : cartridgeRemove }],
]);
