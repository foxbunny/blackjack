export function createDeck() {
	let cards = []

	shuffle()

	function shuffle() {
		let newCards = []

		for (let value = 0; value++ < 13;) newCards.push(
			{suit: 'spades', value},
			{suit: 'heart', value},
			{suit: 'club', value},
			{suit: 'diamond', value},
		)

		while (newCards.length) cards.push(pickRandomCard(newCards))
	}

	function pickRandomCard(cards) {
		return cards.splice(Math.round(Math.random() * (cards.length - 1)), 1)[0]
	}

	function draw() {
		if (!cards.length) shuffle()
		let card = cards.pop()
		return card
		return cards.pop()
	}

	return {
		draw,
	}
} // <-- createDeck
