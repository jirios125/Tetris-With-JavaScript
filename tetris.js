const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // Color de un cuadrado vacio

// Creamos el tablero

let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// Dibujamos el tablero
function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}


// Dibujamos los cuadrados
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}


drawBoard();

// Las piezas y sus colores
//Patrones de piezas en ./tetrominoes.js

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// Generador de piezas random

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length)
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

// El famoso Piece Object

function Piece(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; //Empezamos desde el primer patron
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // Control de la pieza
    this.x = 3;
    this.y = -2;
}

// Fill function

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// Dibujar una pieza en el tablero

Piece.prototype.draw = function(){
    this.fill(this.color);
}

// Des-dibujar la pieza


Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// Mover hacia abajo la pieza

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // Lockeamos a pieza y generamos una nuevita
        this.lock();
        p = randomPiece();
    }

}

// Mover la pieza hacia la derecha
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// Mover la pieza hacia la izquierda
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Rotacion de la pieza
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;

    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // Si hay una pared a la derecha
            kick = -1; // Necesitamos mover la pieza hacia la izquierda
        }else{
            // Si hay una pared a la izquierda
            kick = 1; // Necesitamos mover la pieza hacia la derecha
        }
    }

    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // Salteamos cuadrados vacios
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // Si las piezas llegan y lockean en Y0 Gg bro :l
            if(this.y + r < 0){
                alert("Game Over");
                // Paramos el generamiento de piezas random
                gameOver = true;
                break;
            }
            // Lockear la pieza en Y10
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // Remover filas exitosas
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // Si la ultima fila esta llena
            //Movemos todas las piezas de arriba Y--
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // Incrementa el score
            score += 5;
        }
    }
    // Update del tablero
    drawBoard();

    // Update del score
    scoreElement.innerHTML = score;
}

// Funcion de collision (Gracias Julian :D )

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // Si el cuadrado esta vacio, lo salteamos
            if(!piece[r][c]){
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            if(newY < 0){
                continue;
            }
            // Chequea si hay una pieza lockeada
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// Controlar la pieza

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// La pieza cae cada 1 segundo

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();
