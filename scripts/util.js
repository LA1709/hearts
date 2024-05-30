const getImagesArray = () => {
    let spritesArray = [];
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    const letters = ["J", "Q", "K", "A"];

    const getCard = number => (
        number%13 < 9 ?
            String(number%13 + 2) : letters[number%13 - 9]
    )

    for (let i = 0; i < 52; i++) {
        let img = new Image();
        img.src = "images/card" + suits[Math.floor(i/13)] + getCard(i) + ".png";
        img.classList.add("card-in-hand");
        img.onclick = triggerPlayCard;
        spritesArray.push(img);
    }

    let img = new Image();
    img.src = "images/cardBack.png";
    spritesArray.push(img);

    return spritesArray
}