export function createDeck() {
	let cards = []

	shuffle()

	function shuffle() {
		let newCards = []

		for (let value = 0; value++ < 13;) newCards.push(
			{suit: 'spades', value},
			{suit: 'hearts', value},
			{suit: 'clubs', value},
			{suit: 'diamonds', value},
		)

		while (newCards.length) cards.push(pickRandomCard(newCards))
	}

	function pickRandomCard(cards) {
		return cards.splice(Math.round(Math.random() * (cards.length - 1)), 1)[0]
	}

	function draw() {
		if (!cards.length) shuffle()
		return cards.pop()
	}

	return {
		draw,
	}
} // <-- createDeck
