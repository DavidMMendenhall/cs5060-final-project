// @ts-check
import { RESOURCE_TYPE, TILE_TYPE } from "../tile.js";

let tileEditView = document.createElement("div");
tileEditView.classList.add("tile_edit_view");

/** @type {null | import("../tile").Tile} */
let currentTile = null;

/**
 * 
 * @param {import("../tile.js").Tile} newTile 
 */
let setTile = (newTile) => {
    currentTile = newTile;
    tileTypeInput.value = newTile.type;
    for(let resourceType in RESOURCE_TYPE) {
        resourceCheckboxes[resourceType].checked = newTile.resources.has(resourceType);
    }
}
/** @type {(()=>void)[]} */
let updateListeners = [];

let updateTile = () => {
    if(currentTile){
        currentTile.type = tileTypeInput.value;
        currentTile.resources.clear();
        for(let resourceType in RESOURCE_TYPE) {
            if (resourceCheckboxes[resourceType].checked){
                currentTile.resources.add(resourceType);
            } 
        }
    }
    for(let listener of updateListeners){
        listener();
    }
}

/**
 * 
 * @param {()=>void} callback 
 */
let addUpdateListener = (callback) => {
    updateListeners.push(callback);
}


let tileTypeInput = document.createElement("select");
tileTypeInput.id = "tile_type_input"

for(let tileType in TILE_TYPE) {
    let option = document.createElement("option");
    option.innerText = tileType;
    option.value = tileType;
    tileTypeInput.appendChild(option);
}

tileEditView.appendChild(tileTypeInput);
tileTypeInput.addEventListener('change', updateTile);

let resourceContainer = document.createElement("div");
/**
 * @type {Object<string, HTMLInputElement>}
 */
let resourceCheckboxes = {};


for(let resourceType in RESOURCE_TYPE) {
    let checkBoxContainer = document.createElement("div");
    let label = document.createElement('label');
    label.innerText = resourceType;
    label.setAttribute('for', resourceType);

    let checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.name = resourceType;
    checkBoxContainer.appendChild(checkBox);
    checkBoxContainer.appendChild(label);

    resourceContainer.appendChild(checkBoxContainer);

    resourceCheckboxes[resourceType] = checkBox;
    checkBox.addEventListener('change', updateTile);
}

tileEditView.appendChild(resourceContainer);



export { tileEditView, setTile, addUpdateListener as addTileUpdateListener }



