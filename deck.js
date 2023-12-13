export function createDeck() {
	let cards = []

	for (let value = 0; value++ < 13;) cards.push(
		{suit: 'spade', value},
		{suit: 'heart', value},
		{suit: 'club', value},
		{suit: 'diamond', value},
	)

	{ // shuffle -->
		let shuffled = []
		while (cards.length) shuffled.push(pickRandomCard(cards))
		cards = shuffled
	} // <-- shuffle

	cards.push(
		{suit: 'spade', value: 12},
		{suit: 'spade', value: 1},
		{suit: 'spade', value: 12},
		{suit: 'spade', value: 12},
	)

	function pickRandomCard(cards) {
		return cards.splice(Math.round(Math.random() * (cards.length - 1)), 1)[0]
	}

	function draw() {
		return cards.pop()
	}

	return {
		draw,
	}
} // <-- createDeck
