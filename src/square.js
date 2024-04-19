// @ts-check
// A file for defining The Square in polytopia

import { createTile, TILE_TYPE, RESOURCE_TYPE } from "./tile.js"


/**
 * @typedef Square
 * @prop {import("./tile").Tile[][]} tiles
 * @prop {number} size
 */
/**
 * Base data structure for polytopia
 * @param {number} size 
 * @returns {Square}
 */
let createSquare = (size) =>  {
    /** @type {import("./tile").Tile[][]} */
    let tiles = [];
    for(let x = 0; x < size; x++){
        tiles.push([]);
        for(let y = 0; y < size; y++){
            tiles[x].push(createTile(TILE_TYPE.fog, []));
        }
    }

    return {
        tiles,
        get size(){return size;},
    }
}

/**
 * 
 * @param {Square} square 
 * @returns {Square}
 */
let cloneSquare = (square) => {
    let size = square.size;
    /** @type {import("./tile").Tile[][]} */
    let clonedTiles = [];
    for(let x = 0; x < size; x++){
        clonedTiles.push([]);
        for(let y = 0; y < size; y++){
            clonedTiles[x].push(createTile(square.tiles[x][y].type, [...square.tiles[x][y].resources.values()]));
        }
    }
    return {
        tiles: clonedTiles,
        get size(){return size;},
    }
}

export {createSquare, cloneSquare}