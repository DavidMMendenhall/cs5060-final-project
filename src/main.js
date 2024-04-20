// @ts-check
import { predictVillagesInFog } from "./predictVillage.js";
import { createSquare } from "./square.js";
import { TILE_TYPE } from "./tile.js";
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

/**
 * 
 * @param {number[][]} data 
 * @param {number} row 
 * @param {number} col 
 */
let sumValuesAroundTile = (data, row, col, dist=1) => {
    let sum = 0;
    for(let r = row - dist; r <= row + dist; r++){
        if(r < 0 || r >= data.length){
            continue;
        }

        for(let c = col - dist; c <= col + dist; c++){
            if(c < 0 || c >= data[r].length || (r == row && c == col)){
                continue;
            }
            sum += data[r][c];
        }
    }
    return sum;
}

const DOUBLE_DISCOVER_RADUIS = new Set([TILE_TYPE.mountain, TILE_TYPE.metal]);
let updateTile = () => {
    let predictionLayer = predictVillagesInFog(mySquare);
    myUI.setPredictionLayer(predictionLayer);
    myUI.highlightedTiles.clear();

    let bestValue = 0;
    for(let row = 0; row < mySquare.size; row++){
        for(let col = 0; col < mySquare.size; col++){
            if(mySquare.tiles[row][col].type != TILE_TYPE.fog){
                let areaSum = sumValuesAroundTile(predictionLayer, row, col, DOUBLE_DISCOVER_RADUIS.has(mySquare.tiles[row][col].type) ? 2 : 1);
                if(areaSum > bestValue){
                    bestValue = areaSum;
                    myUI.highlightedTiles.clear();
                    myUI.highlightedTiles.add(`${row},${col}`);

                } else if(areaSum == bestValue){
                    myUI.highlightedTiles.add(`${row},${col}`);
                }
            }
        }
    }
}

addTileUpdateListener(updateTile);
myUI.addClickListener(selectTile);

let draw  = () => {
    myUI.draw();
    requestAnimationFrame(draw);
} 
requestAnimationFrame(draw);

