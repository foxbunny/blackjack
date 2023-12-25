export function createDeck(cards = window.__TEST_DECK) {
	function draw() {
		return cards?.shift() // NB: We use shift() instead of pop() to make tests more readable, in an actual deck it's irrelevant as it is shuffled
	}

	return {
		draw,
	}
} // <-- createDeck
