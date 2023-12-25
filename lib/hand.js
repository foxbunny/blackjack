export function createHand() {
	let cards = []

	function addCard(card, faceDown) {
		if (faceDown) cards.push({suit: 'face-down', value: 0, actual: card})
		else cards.push(card)
	}

	function getCards() {
		return cards
	}

	function revealFaceDownCards() {
		for (let i = 0, card; card = cards[i]; i++)
			if (card.suit == 'face-down')
				 cards[i] = card.actual
	}

	return {
		addCard,
		getCards,
		revealFaceDownCards,
	}
} // <-- createHand