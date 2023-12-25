export function createHandValueCalculator(cards) {
	function getValue() {
		let high = 0
		let low = 0
		for (let card of cards) {
			switch (card.value) {
				case 1:
					high += 11
					low += 1
					break

				case 11:
				case 12:
				case 13:
					high += 10
					low += 10
					break

				default:
					high += card.value
					low += card.value
			}
		}
		if (high > 21) return low
		return high
	}

	function isBlackjack() {
		return cards.length == 2 && getValue() == 21
	}

	function isBust() {
		return getValue() > 21
	}

	return {
		getValue,
		isBlackjack,
		isBust,
	}
}