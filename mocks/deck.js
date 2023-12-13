export function createDeck() {
	function draw() {
		return window.__TEST_DECK?.shift() // NB: We use shift() instead of pop() to make tests more readable, in an actual deck it's irrelevant as it is shuffled
	}

	return {
		draw,
	}
} // <-- createDeck
