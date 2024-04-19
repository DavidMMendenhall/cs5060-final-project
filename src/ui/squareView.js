// @ts-check

import { RESOURCE_TYPE, TILE_TYPE } from "../tile.js";

/**
 * 
 * @param {import("../square").Square} square 
 */
let createSquareUI = (square) => {
    let outerContainer = document.createElement("div");
    outerContainer.classList.add("square_outter");

    let innerContainer = document.createElement("div");
    innerContainer.classList.add("square_inner");
    outerContainer.appendChild(innerContainer);

    let uiTiles = [];
    /** @type {((tile:import("../tile.js").Tile, row:number, col:number)=>void)[]} */
    let listeners = [];
    /**
     * 
     * @param {(tile:import("../tile.js").Tile, row:number, col:number)=>void} listener 
     */
    let addClickListener = (listener) => {
        listeners.push(listener);
    }

    /**
     * 
     * @param {import("../tile.js").Tile} tile 
     * @param {number} row 
     * @param {number} col 
     */
    let click = (tile, row, col) => {
        for(let listener of listeners){
            listener(tile, row, col);
        }
    }

    for(let row = 0; row < square.size; row++){
        for(let col = 0; col < square.size; col++){
            let tile = createTileUI(square.tiles[row][col], row + 1, col + 1);
            innerContainer.appendChild(tile.element);
            tile.addClickListener(click);
            uiTiles.push(tile);
        }
    }

    let update = () => {
        for(let uiTile of uiTiles){
            uiTile.update();
        }
    }

    return {
        element: outerContainer,
        update,
        addClickListener,
    }
}

let TILE_COLOR_MAP = {
    "field": "green",
    "fog": "#AAAAAA",
    "ocean": "blue",
    "water": "cyan",
    "mountain": "green",
    "village": "green",
}

/**
 * 
 * @param {import("../tile").Tile} tile 
 * @param {number} row
 * @param {number} col
 */
let createTileUI = (tile, row, col) => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    if(!ctx){
        throw "Could not obtain canvas context";
    }
    canvas.width = 100;
    canvas.height = 100;
    canvas.classList.add("tile");
    canvas.style.gridRow = row.toString();
    canvas.style.gridColumn = col.toString();

    let clear = () => {
        ctx.clearRect(0, 0, 100, 100);
    }

    let draw = () => {
        clear();
        ctx.fillStyle = TILE_COLOR_MAP[tile.type];
        ctx.fillRect(0, 0, 100, 100);
        if(tile.type == TILE_TYPE.village){
            ctx.beginPath();
            ctx.arc(50, 50, 25, 0, 2 * Math.PI);
            ctx.fillStyle = "tan";
            ctx.fill();
        } else if (tile.type == TILE_TYPE.mountain){
            // draw mountain triangle
            ctx.fillStyle = "grey";
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(10, 25);
            ctx.lineTo(75, 25);
            ctx.lineTo(75, 90);
            ctx.fill();
            ctx.stroke();

            // draw peack
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(50, 25);
            ctx.lineTo(75, 25);
            ctx.lineTo(75, 50);
            ctx.fill();
            ctx.stroke();
        }

        if(tile.resources.has(RESOURCE_TYPE.forest)){
            ctx.beginPath();
            for(let x = 0; x < 3; x++){
                for(let y = 0; y < 3; y++){
                    let _x = x * 30 + 12;
                    let _y = y * 30 + 15;
                    ctx.moveTo(_x + 5, _y);
                    ctx.arc(_x, _y, 10, 0, Math.PI * 2);
                }
            }
            ctx.fillStyle = "brown"
            ctx.fill();

            ctx.beginPath();
            for(let x = 0; x < 3; x++){
                for(let y = 0; y < 3; y++){
                    let _x = x * 30 + 12;
                    let _y = y * 30 + 12;
                    ctx.moveTo(_x + 5, _y);
                    ctx.arc(_x, _y, 10, 0, Math.PI * 2);
                }
            }
            ctx.fillStyle = "darkgreen"
            ctx.fill();
        }

        if(tile.resources.has(RESOURCE_TYPE.crop)){
            ctx.beginPath();
            for(let x = 0; x < 3; x++){
                for(let y = 0; y < 3; y++){
                    let _x = x * 30 + 12;
                    let _y = y * 30 + 12;
                    ctx.moveTo(_x + 5, _y);
                    ctx.arc(_x, _y, 10, 0, Math.PI * 2);
                }
            }
            ctx.fillStyle = "lime"
            ctx.fill();
        }

        if(tile.resources.has(RESOURCE_TYPE.metal)){
            ctx.beginPath();
            for(let x = 1; x < 3; x++){
                for(let y = 1; y < 3; y++){
                    let _x = x * 25 + 12;
                    let _y = y * 25 + 12;
                    ctx.moveTo(_x + 5, _y);
                    ctx.arc(_x, _y, 5, 0, Math.PI * 2);
                }
            }
            ctx.fillStyle = "gold"
            ctx.fill();
        }

        if(tile.resources.has(RESOURCE_TYPE.animal)){
            ctx.beginPath();
            ctx.arc(25, 50, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "orange";
            ctx.fill();
        }
        if(tile.resources.has(RESOURCE_TYPE.fruit)){
            ctx.beginPath();
            ctx.arc(75, 50, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "purple";
            ctx.fill();
        }
        if(tile.resources.has(RESOURCE_TYPE.fish)){
            ctx.beginPath();
            ctx.arc(75, 50, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "pink";
            ctx.fill();
        }
        if(tile.resources.has(RESOURCE_TYPE.star_fish)){
            ctx.beginPath();
            ctx.arc(75, 25, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "gold";
            ctx.fill();
        }
    }

    let update = () => {
        draw();
    }

    /** @type {((tile:import("../tile").Tile, row:number, col:number)=>void)[]} */
    let listeners = [];
    let click = () => {
        for(let listener of listeners){
            listener(tile, row, col);
        }
    }
    canvas.addEventListener('click', click);

    /**
     * 
     * @param {(tile:import("../tile").Tile, row:number, col:number)=>void} callback 
     */
    let addClickListener = (callback) => {
        listeners.push(callback);
    }

    update();
    return {
        element: canvas,
        update,
        addClickListener,
    }
}

export {createSquareUI};