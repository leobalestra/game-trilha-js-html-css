/* Código orginal https://github.com/yadav-rahul/Nine-Mens-Morris*/
var playerOneCode = 1;
var playerTwoCode = 2;
var redBlocks = 0;
var greenBlocks = 0;
var namePlayer1;
var namePlayer2;
var isMillRed = false;
var isMillGreen = false;
var isActiveRed = false;
var isActiveGreen = false;
var isGreenThreeLeft = false;
var isRedThreeLeft = false;
var blockWidth = 16;
var strokeWidth = 2;
var lastX = 0;
var lastY = 0;
var lastCenterX = 0;
var lastCenterY = 0;
var numberOfTurns = 0;
var rows = 7;
var columns = 7;
var clickSound;
var deathSound;
var trilhaSound;
var winnerSound;
var positionMatrix = new Array(7);
var referenceMatrix = new Array(7);
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var multiPLayer = false;
var vezDeQualJogador;
var quemEuSou1or2;
var idSala;
var cliqueNoTabuleiro;

//para subir o app, use npm install e depois npm start
const socket = io.connect('http://localhost:5000');
//const socket = io.connect('https://trilha-fatec.herokuapp.com/')

//mysql = require('mysql');

//Iniciando jogo
function initializeGame() {
    clickSound  = new sound("sounds/sound.wav");
    deathSound  = new sound("sounds/soundExplosion.wav");
    trilhaSound = new sound("sounds/soundTrilha.wav");
    winnerSound = new sound("sounds/soundWinner.wav");

    capSound = new sound("sounds/soundCap.wav");
    ferroSound = new sound("sounds/soundFerro.wav");
    aranhaSound = new sound("sounds/soundAranha.wav");
    thanosSound = new sound("sounds/soundThanos.wav");
    hulkSound = new sound("sounds/soundHulk.wav");
    viuvaSound = new sound("sounds/soundViuva.wav");

    iniciaModal("home-login");
    initializeArray();
}

//Som do jogo
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
}

//Iniciando menu
function iniciaModal(modalID) {
    const modal = document.getElementById(modalID);
    modal.classList.add("mostrar");
    modal.addEventListener('click', (e) => {

        if(e.target.id == "btnSozinho") {
            const name = document.getElementById("nameNew").value;
            if (!name) {
                alert('Coloque um nome para começar!');
                return;
            }
            socket.emit('createGame', { name });
            modal.classList.remove("mostrar");
            multiPLayer = true;
            mudarTurnoJogador(name, 1);
            quemEuSou1or2 = 1;
            namePlayer1 = name;
            namePlayer2 = "Oponente";
        }

        else if (e.target.id == "btnDoisMesmaMaq") {
            namePlayer1 = document.getElementById("nome1").value;
            namePlayer2 = document.getElementById("nome2").value;
            if(namePlayer1 === undefined || namePlayer1 == null || namePlayer1.trim().length <= 0 ||
               namePlayer2 === undefined || namePlayer2 == null || namePlayer2.trim().length <= 0){
                alert("Insira os nomes do dois Jogadores!");
            } else {
                modal.classList.remove("mostrar");
                mudarTurnoJogador(namePlayer1, 1);
            }
        }

        else if (e.target.id == "btnMultiplayer") {
              const name = document.getElementById("nameJoin").value;
              const roomID = document.getElementById("room").value;
              if (!name || !roomID) {
                alert('Coloque o ID da Sala e o Nome!');
                return;
              }
              socket.emit('joinGame', { name, room: roomID });
              modal.classList.remove("mostrar");
              multiPLayer = true;
              mudarTurnoJogador(name, 1);
              quemEuSou1or2 = 2;
              namePlayer1 = "Oponente";
              namePlayer2 = name;
        };
    });
}
            
// Abrindo um novo jogo io
socket.on('newGame', (data) => {
    //console.log("esperando 2");
    idSala = data.room;
    const message =
      `Olá, ${data.name}. Diga para seu oponente entrar da sala ID: 
      ${data.room}. Esperando player 2...`;

    // Create game for player 1
    document.getElementById("message").innerHTML = message;
});

// Player 1 recebendo resposta io
socket.on('player1', (data) => {
    const message = "Seu oponente chegou, pode jogar!";
    document.getElementById("message").innerHTML = message;
});

// Player 2 recebendo resposta io
socket.on('player2', (data) => {
    idSala = data.room;
    //console.log("o dois ta pronto");
    const message = "Pronto, espera seu oponente jogar!";
    // Create game for player 2
     document.getElementById("message").innerHTML = message;
});

// Mudança de turno io
socket.on('turnPlayed', (data) => {
    if(!ehMinhaVezDeJogar()){
        //console.log("recebi!", data);
        const x = data.tile.split(';')[0];
        const y = data.tile.split(';')[1];
        //const opponentType = player.getPlayerType() === P1 ? P2 : P1;
        //game.updateBoard(opponentType, row, col, data.tile);
        //player.setCurrentTurn(true);
        makeMove(x, y);
    }
});

// erro do io
socket.on('err', (data) => {
    alert("A sala está cheia!");
    location.reload();
});

// enviar jogadas para outro jogador
function playTurn() {
    const clickedTile = cliqueNoTabuleiro;
    // Emit an event to update other player that you've played your turn.
    socket.emit('playTurn', {
        tile: clickedTile,
        room: idSala,
      });
}

function recomecarJogo() {
    location.reload(true);
}

//mudar nome e vez do jogador
function mudarTurnoJogador(name, code) {
    console.log("vez do ", code);
    document.getElementById("turn").innerHTML = name;
    vezDeQualJogador = code;
}

// Verificar vez do jogador
function ehMinhaVezDeJogar() {
    //console.log(vezDeQualJogador, quemEuSou1or2);
    if(vezDeQualJogador == quemEuSou1or2) {
        return true
    } else {
        return false;
    };
    return true;
}

//inicia array do tabuleiro
function initializeArray() {
    for (var i = 0; i < 7; i++) {
        referenceMatrix[i] = new Array(7);
        positionMatrix[i] = new Array(7);
    }

    for (var j = 0; j < 7; j++) {
        for (var k = 0; k < 7; k++) {
            //Torne todos os elementos diagonais + fronteira + centro para zero
            if ((j == 3) || (k == 3) || (j == k) || (j + k == 6)) {
                referenceMatrix[j][k] = 0;
                positionMatrix[j][k] = 0;
            }
            else {
                referenceMatrix[j][k] = -1;
                positionMatrix[j][k] = -1;
            }
        }
    }
    //Finaliza fazendo centro também -1
    referenceMatrix[3][3] = -1;
    positionMatrix[3][3] = -1;

}

//Recebe movimento clicado pelo mouse
function makeMove(X, Y) {
    var yCenter;
    var xCenter;
    cliqueNoTabuleiro = X+";"+Y;
    X = Number(X);
    Y = Number(Y);

    switch (X) {
        case 0: {
            switch (Y) {
                case 0: {
                    yCenter = 25;
                    xCenter = 25;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 25;
                    break;
                }
                case 6: {
                    yCenter = 525;
                    xCenter = 25;
                    break;
                }
            }
            break;
        }
        case 1: {
            switch (Y) {
                case 1: {
                    yCenter = 115;
                    xCenter = 115;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 115;
                    break;
                }
                case 5: {
                    yCenter = 435;
                    xCenter = 115;
                    break;
                }
            }
            break;
        }
        case 2: {
            switch (Y) {
                case 2: {
                    yCenter = 195;
                    xCenter = 195;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 195;
                    break;
                }
                case 4: {
                    yCenter = 355;
                    xCenter = 195;
                    break;
                }
            }
            break;
        }
        case 3: {
            switch (Y) {
                case 0: {
                    yCenter = 25;
                    xCenter = 275;
                    break;
                }
                case 1: {
                    yCenter = 115;
                    xCenter = 275;
                    break;
                }
                case 2: {
                    yCenter = 195;
                    xCenter = 275;
                    break;
                }
                case 4: {
                    yCenter = 355;
                    xCenter = 275;
                    break;
                }
                case 5: {
                    yCenter = 435;
                    xCenter = 275;
                    break;
                }
                case 6: {
                    yCenter = 525;
                    xCenter = 275;
                    break;
                }
            }
            break;
        }
        case 4: {
            switch (Y) {
                case 2: {
                    yCenter = 195;
                    xCenter = 355;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 355;
                    break;
                }
                case 4: {
                    yCenter = 355;
                    xCenter = 355;
                    break;
                }
            }
            break;
        }
        case 5: {
            switch (Y) {
                case 1: {
                    yCenter = 115;
                    xCenter = 435;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 435;
                    break;
                }
                case 5: {
                    yCenter = 435;
                    xCenter = 435;
                    break;
                }
            }
            break;
        }
        case 6: {
            switch (Y) {
                case 0: {
                    yCenter = 25;
                    xCenter = 525;
                    break;
                }
                case 3: {
                    yCenter = 275;
                    xCenter = 525;
                    break;
                }
                case 6: {
                    yCenter = 525;
                    xCenter = 525;
                    break;
                }
            }
            break;
        }
    }


    if (isMillGreen || isMillRed) {
        //In this case don't change player turn and remove other player block in next click
        //Nesse caso, não muda o turno do jogador e remove o bloco de outro jogador no próximo clique
        var playerCode = (isMillGreen) ? 1 : 2;
        if (positionMatrix[X][Y] != playerCode && (positionMatrix[X][Y] != 0)) {
            //Check that it shouldn't be the part of other mill
            //Verifica se não deve fazer parte de outra trilha
            if (!checkMill(X, Y, ((isMillRed) ? 1 : 2)) || allArePartOfMill(((isMillRed) ? 1 : 2))) {
                //Remove that block and update array value to zero
                //Remove esse bloco e atualiza o valor da matriz para zero
                clickSound.play();
                if (playerCode == 1) {
                    redBlocks--;
                    document.getElementById("message").innerHTML = "Peça vermelha removida";
                    deathSound.play();

                } else {
                    document.getElementById("message").innerHTML = "Peça verde removida";
                    greenBlocks--;
                    deathSound.play();
                }
                context.clearRect(xCenter - blockWidth - strokeWidth, yCenter - blockWidth - strokeWidth,
                    2 * (blockWidth + strokeWidth), 2 * ( blockWidth + strokeWidth));
                positionMatrix[X][Y] = 0;
                turnOffMill();
                update();
                //Mandar informação para o outro player
                if(!ehMinhaVezDeJogar()){
                    playTurn();
                }
            }
            else {
                document.getElementById("message").innerHTML = "Não é possível remover um bloco que já faz parte da trilha";
            }
        }
    }

    else if (numberOfTurns >= 18 && (isActiveRed || isActiveGreen)) {
        if ((((X == lastX) && (Y == lastY)) || (positionMatrix[X][Y] == 1 || positionMatrix[X][Y] == 2))) {
            turnOffActive(lastCenterX, lastCenterY);
        }

        if ((positionMatrix[X][Y] == 0)) {
            //Checking for adjacent element.
            //Verificando o elemento adjacente.
            if (((X == lastX) || (Y == lastY))) {
                if (X == 0 || X == 6 || Y == 0 || Y == 6) {
                    if (((Math.abs(X - lastX) + Math.abs(Y - lastY)) == 3 ) || ((Math.abs(X - lastX) + Math.abs(Y - lastY)) == 1 )) {
                        //Remove previous block and make a new block at the the given position
                        //Remove o bloco anterior e faz um novo bloco na posição especificada
                        positionMatrix[lastX][lastY] = 0;
                        clearBlock(lastCenterX, lastCenterY);
                        drawBlock(xCenter, yCenter, X, Y);
                        //Mandar informação para o outro player
                        playTurn();
                        if(isMillRed == false && isMillGreen == false) {
                            update();
                        }
                    }
                } else if (X == 1 || X == 5 || Y == 1 || Y == 5) {
                    if (((Math.abs(X - lastX) + Math.abs(Y - lastY)) == 2 ) || ((Math.abs(X - lastX) + Math.abs(Y - lastY)) == 1 )) {
                        //Remove previous block and make a new block at the the given position
                        //Remove o bloco anterior e faz um novo bloco na posição especificada
                        positionMatrix[lastX][lastY] = 0;
                        clearBlock(lastCenterX, lastCenterY);
                        drawBlock(xCenter, yCenter, X, Y);
                        //Mandar informação para o outro player
                        playTurn();
                        if(isMillRed == false && isMillGreen == false) {
                            update();
                        }
                    }
                } else if (X == 2 || X == 4 || Y == 2 || Y == 4) {
                    if (((Math.abs(X - lastX) + Math.abs(Y - lastY)) == 1 )) {
                        //Remove previous block and make a new block at the the given position
                        //Remove o bloco anterior e faz um novo bloco na posição especificada
                        positionMatrix[lastX][lastY] = 0;
                        clearBlock(lastCenterX, lastCenterY);
                        drawBlock(xCenter, yCenter, X, Y);
                        //Mandar informação para o outro player
                        playTurn();
                        if(isMillRed == false && isMillGreen == false) {
                            update();
                        }
                    }
                }

            } else {
                if (isGreenThreeLeft && (positionMatrix[lastX][lastY] == playerOneCode)) {
                    positionMatrix[lastX][lastY] = 0;
                    clearBlock(lastCenterX, lastCenterY);
                    drawBlock(xCenter, yCenter, X, Y);
                    //Mandar informação para o outro player
                    playTurn();
                    console.log("4");
                }
                else if (isRedThreeLeft && (positionMatrix[lastX][lastY] == playerTwoCode)) {
                    positionMatrix[lastX][lastY] = 0;
                    clearBlock(lastCenterX, lastCenterY);
                    drawBlock(xCenter, yCenter, X, Y);
                    //Mandar informação para o outro player
                    playTurn();
                    console.log("5");
                }
                else {
                    turnOffActive(lastCenterX, lastCenterY);
                }

            }
        }
    }

    
    else if (positionMatrix[X][Y] == 0 && numberOfTurns < 18) {
        //Mandar informação para o outro player
        //playTurn();
        clickSound.play();
        if (numberOfTurns % 2 != 0) {
            //Player two made a move, hence made a block red.
            redBlocks++;
            positionMatrix[X][Y] = 2;
            context.beginPath();
            context.arc(xCenter, yCenter, blockWidth, 0, 2 * Math.PI, false);
            context.fillStyle = '#F44336';
            context.fill();
            context.lineWidth = strokeWidth;
            context.strokeStyle = '#003300';
            context.stroke();
            mudarTurnoJogador(namePlayer1, 1);
            //document.getElementById("turn").innerHTML = namePlayer1 /*"Verde"*/;
            if (checkMill(X, Y, 2)) {
                isMillRed = true;
                mudarTurnoJogador(namePlayer2, 2);
                //document.getElementById("turn").innerHTML = namePlayer2 /*"Vermelho"*/;
                document.getElementById("message").innerHTML = "Trilha formada. Clique em uma peça verde e remova.";
                trilhaSound.play();
                playTurn();
            } else {
                document.getElementById("message").innerHTML = "Clique em um lugar vazio para colocar sua peça";
            }

        }
        else {
            //Player one just made a move, hence made a block green
            greenBlocks++;
            positionMatrix[X][Y] = 1;
            context.beginPath();
            context.arc(xCenter, yCenter, blockWidth, 0, 2 * Math.PI, false);
            context.fillStyle = '#2E7D32';
            context.fill();
            context.lineWidth = strokeWidth;
            context.strokeStyle = '#003300';
            context.stroke();
            mudarTurnoJogador(namePlayer2, 2);
            //document.getElementById("turn").innerHTML = namePlayer2 /*"Vermelho"*/;
            if (checkMill(X, Y, 1)) {
                isMillGreen = true;
                mudarTurnoJogador(namePlayer1, 1);
                //document.getElementById("turn").innerHTML = namePlayer1 /*"Verde"*/;
                document.getElementById("message").innerHTML = "Trilha formada. Clique em uma peça vermelha e remova.";
                trilhaSound.play();
                playTurn();
            } else {
                document.getElementById("message").innerHTML = "Clique em um lugar vazio para colocar sua peça";
            }
        }
        if (numberOfTurns == 17) {
            document.getElementById("message").innerHTML = "Agora, mova a peça para um bloco vazio";
        }

        numberOfTurns++;
        if(!ehMinhaVezDeJogar()){
            playTurn();
        }
    }

    else if (numberOfTurns >= 18 && positionMatrix[X][Y] != 0) {
        //osition of hiDo nothing when clicked on empty element and check the all possible moves that
        // a player have after clicking on a  particular ps own color.
        //Não faz nada ao clicar no elemento vazio e verifica todos os movimentos possíveis que
        // um jogador tem depois de clicar em uma posição específica de sua própria cor.
        if (numberOfTurns % 2 != 0 && positionMatrix[X][Y] == 2) {
            //Player two just made a move, hence made a block red.
            //O jogador dois fez um movimento e, portanto, fez um bloco ficar vermelho.
            clickSound.play();
            isActiveRed = true;
            if (checkThreeLeft(playerTwoCode)) {
                isRedThreeLeft = true;
                document.getElementById("message").innerHTML = "Agora o vermelho pode se mover para qualquer lugar (restam apenas 3)";
            } else {
                document.getElementById("message").innerHTML = "Mova uma peça para um bloco vazio";
            }
            updateLastParam(xCenter, yCenter, X, Y);
            context.beginPath();
            context.arc(xCenter, yCenter, blockWidth, 0, 2 * Math.PI, false);
            context.fillStyle = '#FFCDD2';
            context.fill();
            context.lineWidth = strokeWidth;
            context.strokeStyle = '#003300';
            context.stroke();
            //Mandar informação para o outro player
            playTurn();
        }
        else if (numberOfTurns % 2 == 0 && positionMatrix[X][Y] == 1) {
            //Player one just made a move, hence made a block green.
            //O jogador um fez um movimento e, portanto, fez um bloco ficar verde.
            clickSound.play();
            isActiveGreen = true;
            if (checkThreeLeft(playerOneCode)) {
                isGreenThreeLeft = true;
                document.getElementById("message").innerHTML = "Agora o verde pode se mover para qualquer lugar (restam apenas 3)";
            }
            else {
                document.getElementById("message").innerHTML = "Mova uma peça para um bloco vazio";
            }
            updateLastParam(xCenter, yCenter, X, Y);
            context.beginPath();
            context.arc(xCenter, yCenter, blockWidth, 0, 2 * Math.PI, false);
            context.fillStyle = '#AED581';
            context.fill();
            context.lineWidth = strokeWidth;
            context.strokeStyle = '#003300';
            context.stroke();
            //Mandar informação para o outro player
            playTurn();
        }
    } 
    checkGameOver();
}

canvas.addEventListener("click", mouseClick);

//Evento do clique no tabuleiro
function mouseClick(event) {
    //Obtenha as coordenadas X e Y quando toca na tela
    var X = event.clientX - (canvas.getBoundingClientRect()).left;
    var Y = event.clientY - (canvas.getBoundingClientRect()).top;

    //Verifica se o evento de toque ocorre na tela ou não
    if ((X >= 0 && X <= 550) && (Y >= 0 && Y <= 550)) {
        //Se for multiplayer verificar se é a vez no jogador
        if (multiPLayer && !ehMinhaVezDeJogar()) {
            alert("Não é sua vez.\nEspere seu oponente jogar!");
        } else {
            if ((X >= 0 && X <= 75) && (Y >= 0 && Y <= 75)) {
                makeMove(0, 0);
            } else if ((X >= 235 && X <= 315) && (Y >= 0 && Y <= 75)) {
                makeMove(3, 0);
            } else if ((X >= 475 && X <= 550) && (Y >= 0 && Y <= 75)) {
                makeMove(6, 0);
            }
            else if ((X >= 75 && X <= 155) && (Y >= 75 && Y <= 155)) {
                makeMove(1, 1);
            } else if ((X >= 235 && X <= 315) && (Y >= 75 && Y <= 155)) {
                makeMove(3, 1);
            } else if ((X >= 395 && X <= 475) && (Y >= 75 && Y <= 155)) {
                makeMove(5, 1);
            }
            else if ((X >= 155 && X <= 235) && (Y >= 155 && Y <= 235)) {
                makeMove(2, 2);
            } else if ((X >= 235 && X <= 315) && (Y >= 155 && Y <= 235)) {
                makeMove(3, 2);
            } else if ((X >= 315 && X <= 395) && (Y >= 155 && Y <= 235)) {
                makeMove(4, 2);
            }
            else if ((X >= 0 && X <= 75) && (Y >= 235 && Y <= 315)) {
                makeMove(0, 3);
            } else if ((X >= 75 && X <= 155) && (Y >= 235 && Y <= 315)) {
                makeMove(1, 3);
            } else if ((X >= 155 && X <= 235) && (Y >= 235 && Y <= 315)) {
                makeMove(2, 3);
            } else if ((X >= 315 && X <= 395) && (Y >= 235 && Y <= 315)) {
                makeMove(4, 3);
            } else if ((X >= 395 && X <= 475) && (Y >= 235 && Y <= 315)) {
                makeMove(5, 3);
            } else if ((X >= 475 && X <= 550) && (Y >= 235 && Y <= 315)) {
                makeMove(6, 3);
            }
            else if ((X >= 155 && X <= 235) && (Y >= 315 && Y <= 395)) {
                makeMove(2, 4);
            } else if ((X >= 235 && X <= 315) && (Y >= 315 && Y <= 395)) {
                makeMove(3, 4);
            } else if ((X >= 315 && X <= 395) && (Y >= 315 && Y <= 395)) {
                makeMove(4, 4);
            }
            else if ((X >= 75 && X <= 155) && (Y >= 395 && Y <= 475)) {
                makeMove(1, 5);
            } else if ((X >= 235 && X <= 315) && (Y >= 395 && Y <= 475)) {
                makeMove(3, 5);
            } else if ((X >= 395 && X <= 475) && (Y >= 395 && Y <= 475)) {
                makeMove(5, 5);
            }
    
            else if ((X >= 0 && X <= 75) && (Y >= 475 && Y <= 550)) {
                makeMove(0, 6);
            } else if ((X >= 235 && X <= 315) && (Y >= 475 && Y <= 550)) {
                makeMove(3, 6);
            } else if ((X >= 475 && X <= 550) && (Y >= 475 && Y <= 550)) {
                makeMove(6, 6);
            }
        }
    }
}

function updateLastParam(xCenter, yCenter, X, Y) {
    lastCenterX = xCenter;
    lastCenterY = yCenter;
    lastX = X;
    lastY = Y;
}

function turnOffActive(x, y) {
    clickSound.play();
    context.beginPath();
    context.arc(x, y, blockWidth, 0, 2 * Math.PI, false);
    if (isActiveRed) {
        context.fillStyle = '#F44336';
    } else {
        context.fillStyle = '#2E7D32';
    }
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();
    isActiveRed = false;
    isActiveGreen = false;
}

function turnOffMill() {
    isMillGreen = false;
    isMillRed = false;
}

//limpar peça
function clearBlock(xI, yI) {
    clickSound.play();
    //Lipa a posição anterior
    context.clearRect(xI - blockWidth - strokeWidth, yI - blockWidth - strokeWidth,
        2 * (blockWidth + strokeWidth), 2 * ( blockWidth + strokeWidth));
    positionMatrix[lastX][lastY] = 0;
}

//Verifica depois de formar trilha
function drawBlock(x, y, X, Y) {
    context.beginPath();
    context.arc(x, y, blockWidth, 0, 2 * Math.PI, false);
    if (isActiveRed) {
        positionMatrix[X][Y] = 2;
        context.fillStyle = '#F44336';
        if (checkMill(X, Y, 2)) {
            isMillRed = true;
            document.getElementById("message").innerHTML = "Trilha formada. Clique em uma peça Verde e remova.";
            trilhaSound.play();
            //Mandar informação para o outro player
            mudarTurnoJogador(namePlayer2, 2);
            playTurn();
        }
    } else {
        positionMatrix[X][Y] = 1;
        context.fillStyle = '#2E7D32';
        if (checkMill(X, Y, 1)) {
            isMillGreen = true;
            document.getElementById("message").innerHTML = "Trilha formada. Clique em uma peça Vermelha e remova.";
            trilhaSound.play();
            //Mandar informação para o outro player
            mudarTurnoJogador(namePlayer1, 1);  
            playTurn();
        }
    }
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();

    isActiveGreen = false;
    isActiveRed = false;
    numberOfTurns++;
    //update();  
}

function checkMill(x, y, playerCode) {
    //Usando o fato de que duas trilhas não podem ocorrer simultaneamente
    var flag = 0;
    var temp = 0;
    //Transverse through the given row and column and check for mill
    //Transversal através da linha e coluna especificadas e verifica a trilha
    for (var i = 0; i < 5; i++) {
        flag = 0;
        for (var j = temp; j < temp + 3; j++) {
            if (positionMatrix[j][y] == playerCode) {
                continue;
            } else {
                flag = 1;
                break;
            }
        }
        if (flag == 0) {
            //console.log("This is from : " + 1);
            return true;
        } else {
            temp++;
        }
    }

    flag = 0;
    temp = 0;
    //Now moving along the given column
    //Agora movendo-se ao longo da coluna fornecida
    for (var k = 0; k < 5; k++) {
        flag = 0;
        for (var l = temp; l < temp + 3; l++) {
            if (positionMatrix[x][l] == playerCode) {
                continue;
            } else {
                flag = 1;
                break;
            }
        }
        if (flag == 0) {
            // console.log("This is from : " + 2);
            return true;
        } else {
            temp++;
        }
    }

    var check = true;
    var oppositeCode = (playerCode == 1) ? 2 : 1;
    for (var a = 0; a < 7; a++) {
        if ((positionMatrix[a][y] == oppositeCode) || (positionMatrix[a][y] == 0)) {
            check = false;
            break;
        }
    }
    if (check == true) {
        //console.log("This is from : " + 3);
        return true;
    }
    check = true;

    for (var b = 0; b < 7; b++) {
        //Check for any empty element of any element of anther type
        //Verifique se há algum elemento vazio de qualquer elemento do tipo antera
        if ((positionMatrix[x][b] == oppositeCode) || (positionMatrix[x][b] == 0)) {
            check = false;
            break;
        }
    }
    if (check == true) {
        //console.log("This is from : " + 4);
        return true;
    }

    return false;
}

//Verifica se ja pode possuir alguma trilha
function checkThreeLeft(playerCode) {
    return (numberOfTurns >= 18 && (((playerCode == 1) ? greenBlocks : redBlocks) == 3 ))
}

//Verifica se o jogo acabou
function checkGameOver() {
    if (numberOfTurns >= 18) {
        //Se restarem menos de 3 peças de qualquer equipe.
        if (redBlocks < 3 || greenBlocks < 3) {
            alert("Restam apenas 2 blocos " + ((greenBlocks < 3) ? namePlayer1 /*"Green"*/ : namePlayer2 /*"Red"*/) + "!\n" +
                "Logo, Jogador " + ((greenBlocks < 3) ? namePlayer2 /*2*/ : namePlayer1 /*1*/) + " é Campeão!");
            winnerSound.play();
            //location.reload(true);
        }
        else {
            //Verifica se não há nenhum elemento adjacente disponível para nenhum jogador.
            if (!canMove(playerOneCode, greenBlocks)) {
                alert("Nenhum movimento possível para o Jogador " + namePlayer1 /*playerOneCode*/ + "\n" +
                    "Logo, Jogador " + namePlayer2 /*playerTwoCode*/ + " é Campeão!");
                winnerSound.play();
                //location.reload(true);
            } else if (!canMove(playerTwoCode, redBlocks)) {
                alert("Nenhum movimento possível para o Jogador " + namePlayer2 /*playerTwoCode*/ + "\n" +
                    "Logo, Jogador " + namePlayer1 /*playerOneCode*/ + " é Campeão!");
                winnerSound.play();
                //location.reload(true);
            }
        }
    }
}

//Verifica de todos fazem parte de uma trilha
function allArePartOfMill(playerCode) {
    //return false if atleast one of them is not a part of the mill
    //retorna falso se pelo menos um deles não fizer parte da trilha
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            if (positionMatrix[i][j] == playerCode){
                if (!checkMill(i, j, playerCode)) {
                    return false;
                }
            }

        }
    }
    return true;
}

//Retorna true or false dependendo pra ele ele quer ir
function canMove(playerCode, blocksLeft) {
    //Se restarem apenas 3, ele sempre poderá se mover para qualquer lugar
    if (blocksLeft == 3) {
        return true;
    }
    //retorna true mesmo se um deles tiver pelo menos um movimento válido restante
    //só podendo ir para baixo, cima, esquerda, direita
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            if (positionMatrix[j][i] == playerCode) {
                //now move in all four directions until index becomes < 0 || >6
                // or after -1's zero comes at the given position.

                //agora mova-se nas quatro direções até o índice se tornar < 0 || >6
                // ou após -1 zero chegar à posição especificada.

                //Left
                if (!(j == 4 && i == 3)) {
                    for (var k = j - 1; k >= 0; k--) {
                        if (positionMatrix[k][i] != -1) {
                            if (positionMatrix[k][i] == 0) {
                                return true;
                            } else {
                                //Adjacent piece is occupied by some block
                                break;
                            }
                        }
                    }
                }

                //Top
                if (!(j == 3 && i == 4)) {
                    for (var l = i - 1; l >= 0; l--) {
                        if (positionMatrix[j][l] != -1) {
                            if (positionMatrix[j][l] == 0) {
                                return true;
                            } else {
                                //Adjacent piece is occupied by some block
                                break;
                            }
                        }
                    }
                }

                //Right
                if (!(j == 2 && i == 3)) {
                    for (var m = j + 1; m < 7; m++) {
                        if (positionMatrix[m][i] != -1) {
                            if (positionMatrix[m][i] == 0) {
                                return true;
                            } else {
                                //Adjacent piece is occupied by some block
                                break;
                            }
                        }
                    }
                }

                //Bottom
                if (!(j == 3 && i == 2)) {
                    for (var n = i + 1; n < 7; n++) {
                        if (positionMatrix[j][n] != -1) {
                            if (positionMatrix[j][n] == 0) {
                                return true;
                            } else {
                                //Adjacent piece is occupied by some block
                                break;
                            }
                        }
                    }
                }

            }
        }
    }
    return false;
}

function update() {
    if (numberOfTurns % 2 != 0) {
        mudarTurnoJogador(namePlayer2, 2);
        //document.getElementById("turn").innerHTML = namePlayer2;
    } else {
        mudarTurnoJogador(namePlayer1, 1)
        //document.getElementById("turn").innerHTML = namePlayer1;
    }
}

function trocarImagem(caminho) {
    var id = caminho.id;
    if(id == 'tab_cap') {
        document.getElementById('myCanvas').style = "background-image: url('images/main.png');";
        capSound.play();
    } else if (id == 'tab_ferro'){
        document.getElementById('myCanvas').style = "background-image: url('images/main1.png');";
        ferroSound.play();
    } else if (id == 'tab_aranha'){
        document.getElementById('myCanvas').style = "background-image: url('images/main2.png');";
        aranhaSound.play();
    } else if (id == 'tab_hulk'){
        document.getElementById('myCanvas').style = "background-image: url('images/main3.png');";
        hulkSound.play();
    } else if (id == 'tab_thanos'){
        document.getElementById('myCanvas').style = "background-image: url('images/main4.png');";
        thanosSound.play();
    } else if (id == 'tab_viuva'){
        document.getElementById('myCanvas').style = "background-image: url('images/main5.png');";
        viuvaSound.play();
    }else if (id == 'back_geral'){
        document.getElementById('body').style = "background-image: url('images/background.jpg');";
    }else if (id == 'back_cap'){
        document.getElementById('body').style = "background-image: url('images/background1.jpg');";
    }else if (id == 'back_ferro'){
        document.getElementById('body').style = "background-image: url('images/background2.jpg');";
    }else if (id == 'back_aranha'){
        document.getElementById('body').style = "background-image: url('images/background3.jpg');";
    }else if (id == 'back_hulk'){
        document.getElementById('body').style = "background-image: url('images/background4.jpg');";
    }else if (id == 'back_thanos'){
        document.getElementById('body').style = "background-image: url('images/background5.jpg');";
    }else if (id == 'back_viuva'){
        document.getElementById('body').style = "background-image: url('images/background6.jpg');";
    }
}