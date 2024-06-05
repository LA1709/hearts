var sprites, turn, pID = 0, allowedMoves = [-1, 0], cardsPlayed = [], players = [], heartBroken = false, cardHistory = Array(4).fill().map(() => []), isSpecialMove = false, newWin;

window.onload = () => {
    sprites = getImagesArray();
    const startBtn = document.getElementById("start-button");
    startBtn.innerHTML = "Start";
    startBtn.disabled = false;
    // newWin = window.open("");
}

const checkIfSpecial = () => {
    const suitStart = Math.floor(cardsPlayed[0][1] / 13) * 13;
    if (players[turn].cards.every(
        (card) => {
            return (card < suitStart || card >= (suitStart + 13));
        }
    )) isSpecialMove = true;
}

const getOptimalMove = (cards) => {
    // can store player's cards as a map itself to avoid this
    let cardsMap = [[], [], [], []];
    cards.forEach(card =>
        cardsMap[Math.floor(card / 13)].push(card)
    );
    if (cardsPlayed.length == 0) {
        // make these functions, then randomly call one of them -
        if (cardsMap[0].length > 0) {
            if (cardHistory[0].length < 9) return cardsMap[0][cardsMap[0].length - 1];
            if ((cardHistory[0].length + cardsMap[0].length) < 13) {
                if (
                    _.range(cardsMap[0][0]).every(card =>
                        cardHistory[0].includes(card)
                    )
                ) return cardsMap[0][0];
            }
        }
        if (cardsMap[1].length > 0) {
            if (cardHistory[1].length < 9) return cardsMap[1][cardsMap[1].length - 1];
            if ((cardHistory[1].length + cardsMap[1].length) < 13) {
                if (
                    _.range(13, cardsMap[1][0]).every(card =>
                        cardHistory[1].includes(card)
                    )
                ) return cardsMap[1][0];
            }
        }
        if (
            cardsMap[3].length > 0 &&
            cardsMap[3][cardsMap[3].length - 1] < 49 &&
            (cardHistory[3].length + cardsMap[3].length) < 13
        ) {
            if (cardHistory[3].includes(49)) return cardsMap[3][cardsMap[3].length - 1];
            return cardsMap[3][0];
        }
        // Can start with a bigger heart at times
        if (heartBroken) return cardsMap[2][0];
        return (
            cardsMap[0].length ? cardsMap[0][0]
                : cardsMap[1].length ? cardsMap[1][0]
                    : cardsMap[3].length ? cardsMap[3][cardsMap[3].length - 1]
                        : cardsMap[2][0]
        );
    }

    const suitPlayed = Math.floor(cardsPlayed[0][1] / 13);

    if (cardsMap[suitPlayed].length) {
        const containsPoint = cardsPlayed.some(move =>
            (Math.floor(move[1] / 13) == 2 || move[1] == 49)
        );
        if (suitPlayed < 2) {
            if (cardHistory[suitPlayed].length > 9 || containsPoint)
                return cardsMap[suitPlayed][0];
            return cardsMap[suitPlayed][cardsMap[suitPlayed].length - 1];
        }
        if (suitPlayed == 3) {
            if (cardHistory[3].includes(49))
                return cardsMap[3][cardsMap[3].length - 1];
            if (cardsMap[3].includes(49) || cardsPlayed.length == 3) {
                const temp = cardsMap[3].filter(card => card != 49).reverse();
                return temp[temp.length - 1];
            }
            const temp = cardsMap[3].filter(card => card < 49).reverse();
            return temp[temp.length - 1];
        }
        return cardsMap[suitPlayed][0];
    }

    if (cardsMap[3].length) {
        if (cardsMap[3].includes(49) && cards.length < 13) return 49;
        if (cardsMap[3][cardsMap[3].length - 1] > 49)
            return cardsMap[3][cardsMap[3].length - 1]
    }
    if (cardsMap[2].length) return cardsMap[2][cardsMap[2].length - 1];
    return cards[cards.length - 1];
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
        setTimeout(() => givePileToPlayer(turn), 1500);
    } else {
        const x = Math.floor(cardsPlayed[0][1] / 13) * 13;
        turn++; if (turn == 4) turn = 0;
        checkIfSpecial();
        document.getElementById("thinker" + turn).style.opacity = 1;
        allowedMoves = [x, x + 13];
        if (turn != pID)
            setTimeout(
                () => players[turn].playCard(turn, getOptimalMove(players[turn].cards)),
                Math.floor(Math.random() * (1500)) + 500
            );
    }
}

const showPlay = (card) => {
    const a = (Math.floor(Math.random() * 31) + 5) * (Math.random() > 0.5 ? 1 : -1);
    const b = Math.floor(Math.random() * 21) * (Math.random() > 0.5 ? 1 : -1);
    sprites[card].style.transform = `rotate(${a}deg) translateX(${b}px)`;
    document.getElementById("play-table").appendChild(sprites[card]);
    cardHistory[Math.floor(card / 13)].push(card);
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
        if (!heartBroken && cid > 25 && cid < 38)
            heartBroken = true;
        // newWin.console.log(`Player ${pid} played ${cid}`, this.cards);
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
    (c >= allowedMoves[0] && c < allowedMoves[1]) && (heartBroken ?
        true : !(c > 25 && c < 38)
    )
);

const triggerPlayCard = (event) => {
    console.log(turn != pID ? "Not your turn!" :
        isValidMove(event.target.id) ? "Normal play, well done :)" :
            isSpecialMove ? "Special move, nice ;)" : `Invalid Move!`
    );
    if (turn != pID) return
    if (isSpecialMove || isValidMove(event.target.id)) {
        document.getElementById("playing-space").removeChild(event.target);
        players[pID].playCard(pID, parseInt(event.target.id));
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
    console.log(playerCards);
    drawCards(players[pID]);
    findStartingPlayer();
    startBtn.innerHTML = "Play";
    startBtn.style.opacity = 0;
    playerInfoElements = document.getElementsByClassName("player-info")
    for (element of playerInfoElements) {
        element.style.opacity = 1
    };
    document.getElementById("play-table").style.opacity = 1;
    setTimeout(() => startBtn.style.display = "none", 1000)
}