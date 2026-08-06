import { Sprite, Container } from "pixi.js";

/**
 * @typedef {object} Entity
 * @property {() => void} start lifecycle
 * @property {() => void} stop lifecycle
 * @property {() => boolean} hasUpdate if should update
 * @property {() => void} update lifecycle
 * @property {() => void} render lifecycle
 * @property {() => void} destroy lifecycle
 * @property {() => Container} getRenderable get renderable for entity
 * @property {() => Record<string, string>} [getTextureRequests] optional: sprite key -> image url this entity needs
 * @property {(sprites: Record<string, Sprite>) => void} [setTextures] optional: receives loaded sprites, keyed the same as getSpriteRequests
 */

// this will exist at some point probably, cursor kinda just does this for now
