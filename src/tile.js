// @ts-check
// Defines a tile in polytopia

/**
 * @readonly
 * @enum {String}
 */
let TILE_TYPE = {
    water: "water",
    ocean: "ocean",
    mountain: "mountain",
    village: "village",
    field: "field",
    fog: "fog",
}

/**
 * @readonly
 * @enum {String}
 */
let RESOURCE_TYPE = {
    forest: "forest",
    fruit: "fruit",
    metal: "metal",
    animal: "animal",
    ruin: "ruin",
    fish: "fish",
    star_fish: "star_fish",
    crop: "crop"
}

let TILE_RESOURCE_ALLOWED_TABLE = {
    "ocean": {
        resources: {
            "fish": 1,
            "star fish": 1, 
            "ruin": 1,
        }
    },
    "water": {
        resources: {
            "fish": 1,
            "star_fish": 1, 
            "ruin": 1,
        }
    },
    "mountain": {
        resources: {
            "metal": 1,
            "ruin": 1,
        }
    },
    "village": {
        resources: {

        }
    },
    "field": {
        resources: {
            "forest": 1,
            "fruit": 1,
            "animal": 1,
            "ruin": 1,
        }
    }
}


/**
 * @typedef Tile
 * @prop {string} type
 * @prop {Set<string>} resources
 */
/**
 * 
 * @param {TILE_TYPE} type 
 * @param {RESOURCE_TYPE[]} resources 
 * @returns {Tile}
 */
let createTile = (type, resources) => {
    return {
        type,
        resources: new Set(resources),
    }
}

export {createTile, RESOURCE_TYPE, TILE_TYPE, TILE_RESOURCE_ALLOWED_TABLE}