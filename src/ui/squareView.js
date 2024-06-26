// @ts-check

import { RESOURCE_TYPE, TILE_TYPE } from "../tile.js";

/**
 * 
 * @param {import("../square").Square} square 
 */
let createSquareUI = (square) => {
    let outerContainer = document.createElement("div");
    outerContainer.classList.add("square_outter");

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    if(!ctx){
        throw "Failed to get canvas rendering context";
    }
    canvas.classList.add("square_inner")
    outerContainer.appendChild(canvas);

    let mapDx = 0;
    let mapDy = 0;
    let mapZoom = 1;
    let zoomLevel = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseIsDown = false;

    let hoveredTile = null;
    let hoveredTileRow = -1;
    let hoveredTileCol = -1;

    let selectedTileRow = -1;
    let selectedTileCol = -1;

    /** @type {Set<string>} */
    let highlightedTiles = new Set();

    /** @type {number[][] | null} */
    let predictionLayer = null;
    /**
     * 
     * @param {MouseEvent} event 
     */
    let mouseMove = (event) => {
        let bcr = ctx.canvas.getBoundingClientRect();
        let oldX = mouseX;
        let oldY = mouseY;
        mouseX = event.clientX - bcr.x;
        mouseY = event.clientY - bcr.y;
        if(mouseIsDown){
            mapDx += (mouseX - oldX) / mapZoom;
            mapDy += (mouseY - oldY) / mapZoom;
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    let mouseDown = (event) => {
        mouseIsDown = true;
    }
    /**
     * 
     * @param {MouseEvent} event 
     */
    let mouseUp = (event) => {
        mouseIsDown = false;
    }

    /**
     * 
     * @param {WheelEvent} event 
     */
    let mouseScroll = (event) => {
        let amount = -event.deltaY / 200;
        zoomLevel += amount;
        mapZoom = 2 ** zoomLevel;
    }
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mouseout", mouseUp);
    canvas.addEventListener("wheel", mouseScroll);

    let draw = () => {
        let bcr = ctx.canvas.getBoundingClientRect();
        ctx.canvas.width = bcr.width;
        ctx.canvas.height = bcr.height;
        hoveredTile = null;
        hoveredTileRow = -1;
        hoveredTileCol = -1;
        for(let row = 0; row < square.size; row++){
            for(let col = 0; col < square.size; col++){
                ctx.save();
                setTileCanvasTransform(ctx, square.size, row, col, mapZoom, mapDx, mapDy);
                renderTile(square.tiles[row][col], ctx);
                ctx.beginPath();
                ctx.rect(0, 0, 100, 100);
                if(ctx.isPointInPath(mouseX, mouseY)){
                    hoveredTile = square.tiles[row][col];
                    hoveredTileRow = row;
                    hoveredTileCol = col;
                }
                if(predictionLayer && predictionLayer[row][col]){
                    ctx.globalAlpha = predictionLayer[row][col];
                    ctx.fillStyle = "red";
                    ctx.textAlign = "center";
                    ctx.fillRect(0, 0, 100, 100);
                    ctx.globalAlpha = 1;
                    ctx.fillStyle='black';
                    ctx.fillText(predictionLayer[row][col].toFixed(2), 50, 50);
                }
                if(highlightedTiles.has(`${row},${col}`)){
                    ctx.strokeStyle = "magenta"
                    ctx.lineWidth = 10;
                    ctx.strokeRect(0, 0, 100, 100);
                }
                
                ctx.restore();

            }
        }

        if(hoveredTile){
            ctx.save();
            setTileCanvasTransform(ctx, square.size, hoveredTileRow, hoveredTileCol, mapZoom, mapDx, mapDy);
            ctx.strokeStyle = "red"
            ctx.lineWidth = 10;
            ctx.strokeRect(0, 0, 100, 100);
            ctx.restore();
        }

        if(selectedTileCol > -1 && selectedTileRow > -1){
            ctx.save();
            setTileCanvasTransform(ctx, square.size, selectedTileRow, selectedTileCol, mapZoom, mapDx, mapDy);
            ctx.strokeStyle = "orange"
            ctx.lineWidth = 10;
            ctx.strokeRect(0, 0, 100, 100);
            ctx.restore();
        }

    }

    /** @type {((tile:import("../tile.js").Tile, row:number, col:number)=>void)[]} */
    let listeners = [];
    /**
     * 
     * @param {(tile:import("../tile.js").Tile, row:number, col:number)=>void} listener 
     */
    let addClickListener = (listener) => {
        listeners.push(listener);
    }

    let click = () => {
        if(hoveredTile){
            for(let listener of listeners){
                listener(hoveredTile, hoveredTileRow, hoveredTileCol);
            }
        } 
    }
    canvas.addEventListener('click', click);

    /**
     * 
     * @param {number} row 
     * @param {number} col 
     */
    let setSelected = (row, col) => {
        selectedTileCol = col;
        selectedTileRow = row;
    }

    /**
     * 
     * @param {number[][] | null} newOdds
     */
    let setPredictionLayer = (newOdds) => {
        predictionLayer = newOdds;
    }

    let uiObject = {
        element: outerContainer,
        get highlightedTiles(){return highlightedTiles;},
        draw,
        setSelected,
        setPredictionLayer,
        addClickListener,
    }
    return uiObject;
}

const TILE_COLORS = {
    "field": "green",
    "fog": "#EEEEEE",
    "ocean": "blue",
    "water": "cyan",
}

const TILE_BG_COLOR_MAP = {
    "fog": "fog",
    "ocean": "ocean",
    "water": "water",
    "mountain": "field",
    "metal": "field",
    "village": "field",
    "forest": "field",
    "animal": "field",
    "field": "field",
    "fruit": "field",
    "crop": "field",
}

/**
 * 
 * @param {number} mapSize the number of tiles along the side of the square map
 * @param {number} row 
 * @param {number} col 
 * @param {number} zoom the magnification of the map
 * @param {number} dx horizontal offset in pixels prior to zoom
 * @param {number} dy vertical offset in pixels prior to zoom
 * @param {CanvasRenderingContext2D} ctx 
 */
let setTileCanvasTransform = (ctx, mapSize, row, col, zoom, dx, dy) => {
    // compute bounds of square
    const TILE_SPACE = 100;
    let canvasWidthPx = ctx.canvas.width;
    let canvasHeightPx = ctx.canvas.height;

    let squareDimensionsPx = Math.min(canvasWidthPx, canvasHeightPx);
    let tileSizePx = squareDimensionsPx / mapSize;

    ctx.translate(canvasWidthPx/2, canvasHeightPx/2);
    ctx.scale(zoom, zoom);
    ctx.translate(dx, dy);
    ctx.scale(1, 0.5);
    ctx.rotate(-Math.PI / 4);
    ctx.scale(tileSizePx / TILE_SPACE, tileSizePx / TILE_SPACE);
    ctx.translate(row * TILE_SPACE, col * TILE_SPACE);
}



/**
 * Draws a tile from coordinates 1 - 100.
 * Assumes spaces is already set up for tile
 * @param {import("../tile.js").Tile} tile 
 * @param {CanvasRenderingContext2D} ctx 
 */
let renderTile = (tile, ctx) => {
    ctx.fillStyle = TILE_COLORS[TILE_BG_COLOR_MAP[tile.type]];
    ctx.fillRect(0, 0, 100, 100);

    let drawForest = () => {
        ctx.beginPath();
        for(let x = 0; x < 3; x++){
            for(let y = 0; y < 3; y++){
                let _x = x * 30 + 20;
                let _y = y * 30 + 22;
                ctx.moveTo(_x + 5, _y);
                ctx.arc(_x, _y, 10, 0, Math.PI * 2);
            }
        }
        ctx.fillStyle = "brown"
        ctx.fill();

        ctx.beginPath();
        for(let x = 0; x < 3; x++){
            for(let y = 0; y < 3; y++){
                let _x = x * 30 + 20;
                let _y = y * 30 + 20;
                ctx.moveTo(_x + 5, _y);
                ctx.arc(_x, _y, 10, 0, Math.PI * 2);
            }
        }
        ctx.fillStyle = "darkgreen"
        ctx.fill();
    }

    let drawMountain = () => {
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

    switch(tile.type){
        case TILE_TYPE.village:{
            ctx.beginPath();
            ctx.arc(50, 50, 25, 0, 2 * Math.PI);
            ctx.fillStyle = "tan";
            ctx.fill();
            break;
        }
        case TILE_TYPE.forest:{
            drawForest();
            break;
        }
        case TILE_TYPE.animal:{
            drawForest();
            ctx.beginPath();
            ctx.arc(25, 50, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "orange";
            ctx.fill();
            break;
        }
        case TILE_TYPE.mountain:{
            drawMountain();
            break;
        }
        case TILE_TYPE.metal:{
            drawMountain();
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
            break;
        }
        case TILE_TYPE.crop:{
            ctx.beginPath();
            for(let x = 0; x < 4; x++){
                for(let y = 0; y < 4; y++){
                    let _x = x * 20 + 20;
                    let _y = y * 20 + 20;
                    ctx.moveTo(_x + 5, _y);
                    ctx.arc(_x, _y, 5, 0, Math.PI * 2);
                }
            }
            ctx.fillStyle = "lime"
            ctx.fill();
            break;
        }
        case TILE_TYPE.fruit:{
            ctx.beginPath();
            ctx.arc(75, 50, 20, 0, 2 * Math.PI);
            ctx.fillStyle = "purple";
            ctx.fill();
            break;
        }
        case TILE_TYPE.water: // fallthrough
        case TILE_TYPE.ocean: // fallthrough
        case TILE_TYPE.field: // fallthrough
        case TILE_TYPE.fog: break;
        default:{
            ctx.fillStyle = "black"
            ctx.fillText(tile.type, 50, 50);
        }
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

    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, 100, 100);
}

export {createSquareUI};