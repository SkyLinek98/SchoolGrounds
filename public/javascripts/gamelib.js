const width = 1080;
const height = 500;

var playerId;
var scoreBoard;

const CARDSPACE = 100;
var hand = [];
const HANDX = 300;
const HANDY = 340;
var table = [];
const TABLEX = 400;
const TABLEY = 180;
var opponent = [];
const OPX = 400;
const OPY = 20;

var attackButton =  new Button("Attack",800,370, attack);
var playButton = new Button("Play Card",140, 370, play);
var endTurnButton = new Button("End Turn",800,420, end);
var doneButton = new Button("Combat",140, 420, done);
var buttons = [ attackButton, playButton, endTurnButton, doneButton];

var startingTurn = false;

async function refresh() {
    if (scoreBoard && 
        (scoreBoard.getPlayerState() == "Wait" ||
        scoreBoard.getPlayerState() == "Endturn")) {
            await loadScoreBoard();
            await loadCards();
            setCardsState();
            startingTurn = true;        
    } else if (startingTurn) {
        await loadScoreBoard();
        await loadCards();
        setCardsState();
        refreshButtons();
        startingTurn = false;            
    } 
}

async function play() {
    let card = returnSelected(hand);
    await requestPlay(playerId,playerMatchId,card.getId(), card.getCost());
    await loadScoreBoard();
    await loadCards();
    setCardsState();
    refreshButtons();
}

async function done() {
    await requestDone(playerId,playerMatchId);
    await loadScoreBoard();
    await loadCards();
    setCardsState();
    refreshButtons();
}

async function attack() {
    let card = returnSelected(table);
    let ocard = returnSelected(opponent);
    await requestAttack(playerId,playerMatchId,card.getId(),ocard.getId());
    await loadCards();
    setCardsState();
    refreshButtons();
}
async function attackPlayer() {
    let card = returnSelected(table);
    await requestAttackPlayer(playerId,playerMatchId,card.getId());
    await loadCards();
    await loadScoreBoard();
    setCardsState();
    refreshButtons();
}
async function end() {
    await requestEndTurn(playerId,playerMatchId);
    await loadCards();
    await loadScoreBoard();
    setCardsState();
    refreshButtons();
} 

function preload() {

}

async function loadScoreBoard() {
    let p1 = await requestPlayerMatchInfo(playerMatchId);
    let p2 = await requestPlayerMatchInfo(opponentMatchId);
    playerId = p1.ply_id;
    scoreBoard = new ScoreBoard(p1.ply_name, p2.ply_name, 
           p1.pm_hp, p1.pm_energy, p2.pm_hp, p1.pms_name, p2.pms_name,p1.mt_turn,p1.mt_finished); 
}

async function setup() {
    noLoop();
    let canvas = createCanvas(width, height);
    canvas.parent('game');
    // preload card images
    let cards = await requestCardsInfo();
    for (let card of cards) {
        Card.images[card.crd_id] = await loadImage(card.crd_url);
    }
    await loadScoreBoard();
    await loadCards();
    setCardsState();
    refreshButtons();
    setInterval(refresh,1000);
    loop();
}

function refreshButtons() {
    for(let button of buttons) {
        button.hide();
        button.disable();
    }
    if (scoreBoard.isGameover()) return;
   
    if (scoreBoard.getPlayerState() === "PlayCard") {
        playButton.show();
        endTurnButton.show();
        endTurnButton.enable();
        doneButton.show();
        doneButton.enable();
        if (returnSelected(hand)) playButton.enable();
    } else if (scoreBoard.getPlayerState() === "Attack") {
        attackButton.show();
        endTurnButton.show();
        endTurnButton.enable();
        let countAlive = 0;
        for(let card of opponent) 
        if (card.getHp() > 0) countAlive++;
        if (countAlive == 0) {
            attackButton.setNewFunc(attackPlayer,"Attack Player");
            if (returnSelected(table)) attackButton.enable();
        } else {
            attackButton.setNewFunc(attack,"Attack");
            if (returnSelected(table) && returnSelected(opponent)) 
                attackButton.enable();      
        }
    }
}

function setCardsState() {
    for(let card of hand) card.disable();
    for(let card of table) card.disable();
    for(let card of opponent) card.disable();
    if (scoreBoard.isGameover()) return;
    
    if (scoreBoard.getPlayerState() === "PlayCard") {
        for(let card of hand) card.enable();
    } else if (scoreBoard.getPlayerState() === "Attack") {
        for(let card of table) 
           if (!card.hasAttacked()) card.enable();
        if (returnSelected(table)) {
            for(let card of opponent) 
                if (card.getHp() > 0) card.enable();
        }
    }   
}



async function loadCards() {
    let myCards = await requestPlayerMatchDeck(playerId, playerMatchId);
    let opCards = await requestPlayerMatchDeck(playerId, opponentMatchId);
    let handPos = 0;
    hand = [];
    let tablePos = 0;
    table = [];
    let opPos = 0;
    opponent = [];
    for (let card of myCards) {
        if (card.cp_name === "Hand") {
            hand.push(new Card(card.deck_id, card.deck_card_id, card.crd_name, card.crd_cost, card.deck_card_hp, card.deck_card_atk, 
                false,
                HANDX + CARDSPACE * handPos, HANDY));
            handPos++;
        } else {
            table.push(new Card(card.deck_id,card.deck_card_id,card.crd_name, card.crd_cost, card.deck_card_hp, card.deck_card_atk,
                card.cp_name === "TablePlayed",
                TABLEX + CARDSPACE * tablePos, TABLEY));
            tablePos++;
        }
    }
    for (let card of opCards) {
        opponent.push(new Card(card.deck_id,card.deck_card_id,card.crd_name, card.crd_cost, card.deck_card_hp, card.deck_card_atk,
            card.cp_name === "TablePlayed",
            OPX + CARDSPACE * opPos, OPY));
        opPos++;
    }
}

function draw(){
    background(220);
    scoreBoard.draw();
    for (let card of table) card.draw();
    for (let card of hand) card.draw();
    for (let card of opponent) card.draw();
    for (let button of buttons) button.draw();

}



function mouseClicked() {
    let card;
    
    card = returnSelected(table);
    if (card) {
        // if we deselect a table card we deselect the opponent card also
        if (card.clicked(mouseX, mouseY)) 
            for (let card of opponent) card.deselect();    
    } else for (let card of table) card.clicked(mouseX, mouseY);
    

    card = returnSelected(hand);
    if (card) card.clicked(mouseX, mouseY);
    else for (let card of hand) card.clicked(mouseX, mouseY);
    
    card = returnSelected(opponent);
    if (card) card.clicked(mouseX, mouseY);
    else for (let card of opponent) card.clicked(mouseX, mouseY);

    setCardsState();
    refreshButtons();
    
    for (let button of buttons) button.clicked(mouseX,mouseY);
}

function returnSelected(cardList) {
    for(let card of cardList) {
        if (card.isSelected()) return card;
    }
    return null;
}
