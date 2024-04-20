// @ts-check
import { predictVillagesInFog } from "./predictVillage.js";
import { createSquare } from "./square.js";
import { createSquareUI } from "./ui/squareView.js";
import { tileEditView, setTile, addTileUpdateListener } from "./ui/tileEditView.js";
let squareHolder = document.createElement("div");
squareHolder.id = "square_view";
document.body.appendChild(squareHolder);
document.body.appendChild(tileEditView);

let mySquare = createSquare(16);
let myUI = createSquareUI(mySquare);

squareHolder.appendChild(myUI.element);

/**
 * 
 * @param {import("./tile.js").Tile} tile 
 * @param {number} row 
 * @param {number} col 
 */
let selectTile = (tile, row, col) => {
    setTile(tile);
    myUI.setSelected(row, col);
}

let updateTile = () => {
    let predictionLayer = predictVillagesInFog(mySquare);
    myUI.setPredictionLayer(predictionLayer);
}

addTileUpdateListener(updateTile);
myUI.addClickListener(selectTile);

let draw  = () => {
    myUI.draw();
    requestAnimationFrame(draw);
} 
requestAnimationFrame(draw);

