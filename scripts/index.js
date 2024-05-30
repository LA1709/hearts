var sprites, turn, pID = 0, allowedMoves = [-1, 0], cardsPlayed = [], players = [], heartBroken = false, isSpecialMove = false;

window.onload = () => {
    sprites = getImagesArray();
    const startBtn = document.getElementById("start-button");
    startBtn.innerHTML = "Start";
    startBtn.disabled = false;
}

const checkIfSpecial = () => {
    // Remove this when you make the other players intelligent too
    if (turn != pID) return;

    const suitStart = Math.floor(cardsPlayed[0][1] / 13) * 13;
    if (players[turn].cards.every(
        (card) => {
            return (card < suitStart || card > (suitStart + 13));
        }
    )) isSpecialMove = true;
}

const getOptimalMove = (cards) => {
    if (cardsPlayed.length == 0) return cards[0];
    const suitEnd = (Math.floor(cardsPlayed[0][1] / 13) * 13) + 13;
    const reverseArr = cards.slice().reverse();
    const lastOfSuit = reverseArr.find(card => card <= suitEnd);

    // If the player does not have any card in the suit at hand,
    // play the biggest card they have
    if (!lastOfSuit) return reverseArr[0];

    return lastOfSuit;
}

const nextTurn = () => {
    allowedMoves = [];
    document.getElementById("thinker" + turn).style.opacity = 0;
    if (cardsPlayed.length === 4) {
        let hand = 0;
        cardsPlayed.forEach((item, idx) => {
            if (Math.floor(cardsPlayed[0][1] / 13) == Math.floor(item[1] / 13) &&
                item[1] > cardsPlayed[hand][1]
            ) hand = idx;
        });
        turn = cardsPlayed[hand][0];
        players[turn].keepCards(Object.values(cardsPlayed).map(item => item[1]));
        setTimeout(() => givePileToPlayer(turn), 2500);
    } else {
        const x = Math.floor(cardsPlayed[0][1] / 13) * 13;
        checkIfSpecial();
        turn++; if (turn == 4) turn = 0;
        if (turn != pID)
            setTimeout(
                () => players[turn].playCard(turn, getOptimalMove(players[turn].cards)),
                Math.floor(Math.random() * (1500)) + 500
            );
        document.getElementById("thinker" + turn).style.opacity = 1;
        allowedMoves = [x, x + 13];
    }
}

const showPlay = (card) => {
    console.log(`Player no. ${turn} played card no. ${card} | `, `Heart ${heartBroken ? "" : "not"} broken!`);
    const a = (Math.floor(Math.random() * 31) + 5) * (Math.random() > 0.5 ? 1 : -1);
    const b = Math.floor(Math.random() * 21) * (Math.random() > 0.5 ? 1 : -1);
    sprites[card].style.transform = `rotate(${a}deg) translateX(${b}px)`;
    document.getElementById("play-table").appendChild(sprites[card]);
    nextTurn();
}

const givePileToPlayer = (player) => {
    for (let t = 0; t < 4; t++) {
        const a = (Math.floor(Math.random() * 31) + 5) * (Math.random() > 0.5 ? 1 : -1);
        const b = Math.floor(Math.random() * 21) * (Math.random() > 0.5 ? 1 : -1);
        const backCard = sprites[52].cloneNode(true);
        backCard.style.transform = `rotate(${a}deg) translateX(${b}px)`;
        const playerTable = document.getElementById(`player${player}-table`);
        playerTable.appendChild(backCard);
    }
    document.getElementById("play-table").innerHTML = "";
    checkIfSpecial();
    cardsPlayed = [];
    document.getElementById("thinker" + turn).style.opacity = 1;
    allowedMoves = [0, 52];
    if (turn != pID)
        setTimeout(
            () => players[turn].playCard(turn, getOptimalMove(players[turn].cards)),
            Math.floor(Math.random() * (1500)) + 500
        );
}

class Player {
    constructor(cards) {
        this.cards = _.sortBy(cards);
        this.pot = [];
    }
    playCard(pid, cid) {
        cardsPlayed.push([pid, cid]);
        this.cards.splice(this.cards.indexOf(cid), 1);
        if (isSpecialMove) isSpecialMove = false;
        if (!heartBroken && cid > 25 && cid < 39)
            heartBroken = true;
        showPlay(cid);
    }
    keepCards(cards) {
        this.pot = this.pot.concat(cards);
    }
}

const drawCards = (player) => {
    const mySpace = document.getElementById("playing-space");
    for (card of player.cards) {
        sprites[card].id = card;
        mySpace.appendChild(sprites[card]);
    }
}

const isValidMove = (c) => (
    (c > allowedMoves[0] && c < allowedMoves[1]) && (heartBroken ?
        true : !(c > 25 && c < 39)
    )
);

// Only gets triggerred on click by the user, not when the computer plays
const triggerPlayCard = (event) => {
    if (turn != pID) return
    if (isSpecialMove || isValidMove(event.target.id)) {
        document.getElementById("playing-space").removeChild(event.target);
        players[pID].playCard(pID, parseInt(event.target.id));
    } else {
        // make red outline on css "active" selector for move not allowed
    }
}

const findStartingPlayer = () => {
    players.forEach((player, idx) => {
        if (player.cards[0] === 0)
            turn = idx;
    });
    allowedMoves[1] = 1;
    document.getElementById("thinker" + turn).style.opacity = 1;
    if (turn != pID)
        setTimeout(() => players[turn].playCard(turn, 0),
            Math.floor(Math.random() * (1500)) + 500
        )
}

const startGame = () => {
    const startBtn = document.getElementById("start-button");
    startBtn.innerHTML = "Shuffling";
    startBtn.disabled = true;
    const playerCards = _.chunk(_.shuffle(_.range(52)), 13);
    players.push(new Player(playerCards[0]));
    players.push(new Player(playerCards[1]));
    players.push(new Player(playerCards[2]));
    players.push(new Player(playerCards[3]));
    drawCards(players[pID]);
    findStartingPlayer();
    startBtn.innerHTML = "Play";
    startBtn.style.opacity = 0;
    document.getElementById("play-table").style.opacity = 1;
    setTimeout(() => startBtn.style.display = "none", 1100)
}