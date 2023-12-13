let Bus = (function () {
	function send(message, payload) {
		window.dispatchEvent(new CustomEvent(
			'#' + message,
			{detail: payload},
		))
	}

	function on(message, listener) {
		window.addEventListener('#' + message, function (ev) {
			listener(ev.detail)
		})
	}

	return {send, on}
}()) // <-- Bus

let Blackjack = (function () {
	function createDeck() {
		let cards = []

		for (let value = 0; value++ < 13;)
			cards.push(
				{suit: 'spade', value},
				{suit: 'heart', value},
				{suit: 'club', value},
				{suit: 'diamond', value},
			)

		{
			let shuffled = []
			while (cards.length) {
				let randomCard = cards.splice(
					Math.round(Math.random() * (cards.length - 1)),
					1
				)[0]
				shuffled.push(randomCard)
			}
			cards = shuffled
		}

		function draw() {
			return cards.pop()
		}

		return {
			draw,
		}
	} // <-- createDeck

	function createHand() {
		let cards = []
		let hole

		function addCard(card) {
			cards.push(card)
		}

		function addHole(card) {
			hole = card
		}

		function getCards() {
			if (hole) return [{suit: 'hole'}].concat(cards)
			return cards
		}

		function hasHole() {
			return hole != null
		}

		return {
			addCard,
			addHole,
			getCards,
			hasHole,
		}
	} // <-- createHand

	function* createRound() {
		let deck = createDeck()
		let dealerHand = createHand()
		let playerHand = createHand()
		let outcome = ''

		// Initial deal

		playerHand.addCard(deck.draw())
		dealerHand.addCard(deck.draw())
		playerHand.addCard(deck.draw())
		dealerHand.addHole(deck.draw())

		// Blackjack or push?


		// Continue

		yield {
			dealerCards: dealerHand.getCards(),
			playerCards: playerHand.getCards(),
		}
	} // <-- createRound

	return {
		createRound,
	}
}()) // <-- Blackjack

initialScreen({
	bus: Bus,
	elements: {
		region: document.getElementById('initial-screen'),
		startGameTrigger: document.getElementById('start-game'),
	},
})
gameScreen({
	bus: Bus,
	elements: {
		region: document.getElementById('game-screen'),
		dealerCards: document.getElementById('dealer-cards'),
		playerCards: document.getElementById('player-cards'),
		cardTemplate: document.querySelector('template[data-name=card]').content,
	},
})

function initialScreen(options) {
	let {elements, bus} = options

	elements.startGameTrigger.addEventListener('click', startGame)

	function startGame() {
		elements.region.hidden = true
		bus.send('startGame')
	}
}

function gameScreen(options) {
	let {elements, bus} = options
	let currentRound

	bus.on('startGame', prepare)

	function prepare() {
		elements.region.hidden = false
		currentRound = Blackjack.createRound()
		render(currentRound.next().value)
	}

	function render(gameState) {
		renderDealerCards(gameState.dealerCards)
		renderPlayerCards(gameState.playerCards)
	}

	function renderDealerCards(cards) {
		let {dealerCards} = elements
		for (let i = dealerCards.children.length; i < cards.length; i++) {
			let card = cards[i]
			// NB: Dealer hands are always rendered in reverse, except the hole
			if (card.suit == 'hole') dealerCards.append(renderHole())
			else dealerCards.append(renderCard(cards[i]))
		}
	}

	function renderPlayerCards(cards) {
		let {playerCards} = elements
		for (let i = playerCards.children.length; i < cards.length; i++)
			playerCards.append(renderCard(cards[i]))
	}

	function renderCard(card) {
		let cardNode = elements.cardTemplate.cloneNode(true)

		cardNode.querySelector('[data-slot=suit]').textContent = card.suit
		cardNode.querySelector('[data-slot=value]').textContent = formatCardValue(card.value)
		return cardNode
	}

	function renderHole() {
		let cardNode = elements.cardTemplate.cloneNode(true)
		let cardSlot = cardNode.querySelector('[data-slot=card]')
		cardSlot.dataset.facedown = true
		cardSlot.textContent = 'face-down card'
		return cardNode
	}

	function formatCardValue(value) {
		switch (value) {
			case 1:
				return 'ace'
			case 11:
				return 'jack'
			case 12:
				return 'queen'
			case 13:
				return 'king'
			default:
				return value
		}
	}
}