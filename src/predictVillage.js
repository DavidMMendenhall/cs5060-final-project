// @ts-check
// assuming luxidor/default generation

import { RESOURCE_TYPE, TILE_TYPE } from "./tile.js";


// data from https://polytopia.fandom.com/wiki/Map_Generation

/**
 * 	                    Inner City	    Outer City
    Field (Total)	    48%	            48%
    Fruit	            18%	            6%
    Crop	            18%	            6%
    Empty Field	        12%	            36%

    Forest (Total)	    38%	            38%
    Animal	            19%	            6%
    Empty Forest	    19%	            32%

    Mountain (Total)	14%	            14%
    Metal	            11%	            3%
    Empty Mountain	    3%	            11%

    Fish will be in 50% of water tiles within 2 tiles of a village.
    Star fish can spawn in any water tile
 */

/**
 * Math Time!
 * We are given both the problablity of the spawn rates of resources given the are adjacent to a 
 * city (inner city in the table) and we are given the probablity if the tile is not adjacent to 
 * a city. A special note is that all resource tiles must be within 2 tiles of a city (or else they
 * could possibly not be collected). There are also some specail rules that will be applied to rule
 * out impossible conditions, such as vilages spawning on the edge of the map, and villages being too
 * close to each other, and village being next to the ocean (must be shallow water)
 * 
 * so we have P(resource | near village) what we want is P(near village | resource)
 * 
 */

const PROB = {
    "mountain": 0.074,
    "metal": 0.054,
    "forest": 0.228,
    "animal": 0.114,
    "fruit":0.084,
    "crop":0.101,
    "field":0.258,
    "village":0.087,

    "fruit|village":0.18,
    "crop|village":0.18,
    "field|village":0.12,
    "animal|village":0.19,
    "forest|village":0.19,
    "metal|village":0.11,
    "mountain|village":0.03,
    // TBC later
    "village|fruit": 0,
    "village|crop":0,
    "village|field":0,
    "village|animal":0,
    "village|forest":0,
    "village|metal":0,
    "village|mountan":0,
}

// compute village|XXX probablitites

PROB['village|fruit'] = PROB['village'] * PROB['fruit|village'] / PROB["fruit"];
PROB['village|crop'] = PROB['village'] * PROB['crop|village'] / PROB["crop"];
PROB['village|field'] = PROB['village'] * PROB['field|village'] / PROB["field"];
PROB['village|animal'] = PROB['village'] * PROB['animal|village'] / PROB["animal"];
PROB['village|forest'] = PROB['village'] * PROB['forest|village'] / PROB["forest"];
PROB['village|metal'] = PROB['village'] * PROB['metal|village'] / PROB["metal"];
PROB['village|mountain'] = PROB['village'] * PROB['mountain|village'] / PROB["mountain"];

/**
 * 
 * @param {import("./square").Square} square 
 * @param {number} row 
 * @param {number} col 
 */
let canHaveVillageInFog = (square, row, col) => {
    // check for edges and make sure tile in quesiton is fog
    if(row < 1 || col < 1 ||
        row + 1 >= square.size || col + 1 >= square.size ||
        square.tiles[row][col].type != TILE_TYPE.fog){
        return false;
    }

    // check to make sure there is no ocean adjacent
    if(square.tiles[row + 1][col].type == TILE_TYPE.ocean ||
        square.tiles[row - 1][col].type == TILE_TYPE.ocean||
        square.tiles[row][col + 1].type == TILE_TYPE.ocean||
        square.tiles[row][col - 1].type == TILE_TYPE.ocean){
            return false;
    }

    // check there is no other village with-in 2 tiles
    for(let r = row - 2; r <= row + 2; r++){
        if(r < 0 || r >= square.size){
            continue;
        }
        for(let c = col-2; c <= col + 2; c++){
            if(c < 0 || c >= square.size){
                continue;
            }
            if(square.tiles[r][c].type == TILE_TYPE.village){
                return false;
            }
        }
    }
    return true;
} 

/**
 * 
 * @param {import("./square").Square} square 
 * @param {number} row 
 * @param {number} col 
 */
let getFogTilesNearbyThatCanHaveVillages = (square, row, col) => {
    /** @type {{row:number, col:number}[]} */
    let foggyTiles = [];
    for(let r = 0; r < 3; r++){
        if(row + r - 1 < 0 || row + r -1 >= square.size){
            continue;
        }
        for(let c = 0; c < 3; c++){
            if(r==1 && col==1){
                continue;
            }
            if(col + c - 1 < 0 || col + c - 1 >= square.size){
                continue;
            }
            if(canHaveVillageInFog(square, row + r - 1, col + c - 1)){
                foggyTiles.push({
                    row: row + r - 1,
                    col: col + c - 1
                })
            }
            
        }
    }
    return foggyTiles;
}

/**
 * 
 * @param {import("./square").Square} square 
 */
let predictVillagesInFog = (square) => {
    /** @type {number[][]} */
    let result = [];
    for(let row = 0; row < square.size; row++){
        let _r = [];
        result.push(_r)
        for(let col = 0; col < square.size; col ++){
            _r.push(0);
        }
    }

    for(let row = 0; row < square.size; row ++){
        for(let col = 0; col < square.size; col ++){
            if(square.tiles[row][col].type == TILE_TYPE.fog){
                if(canHaveVillageInFog(square, row, col)){
                    result[row][col] += PROB["village"];
                }
                continue;
            }
            let nearbyFog = getFogTilesNearbyThatCanHaveVillages(square, row, col);
            if(nearbyFog.length == 0){
                continue;
            }
            let probNearVillage = PROB[`village|${square.tiles[row][col].type}`] || 0;
            let oddsPerTile = probNearVillage / nearbyFog.length;
            for(let fogTile of nearbyFog){
                result[fogTile.row][fogTile.col] += oddsPerTile;
            }
        }
    }
    return result;
}

export {predictVillagesInFog}
