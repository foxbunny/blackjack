import * as Deck from './deck.js'

let Bus = (function () {
	function send(message, payload) {
		window.dispatchEvent(new CustomEvent(
			'#' + message,
			{detail: payload},
		))
	} // <-- send

	function on(message, listener) {
		window.addEventListener('#' + message, function (ev) {
			listener(ev.detail)
		})
	} // <-- on

	return {send, on}
}()) // <-- Bus

let Blackjack = (function () {
	// Game events
	let NEW_ROUND = 'new round'
	let DEAL_TO_PLAYER = 'deal to player'
	let DEAL_TO_DEALER = 'deal to dealer'
	let PLAYER_HAS_BLACKJACK = 'player has backjack'
	let DEALER_REVEALS_HOLE = 'dealer reveals hole'
	let PLAYERS_TURN = 'player\'s turn'
	let DEALERS_TURN = 'dealer\'s turn'
	let ITS_A_PUSH = 'it\'s a push'
	let ITS_A_BUST = 'it\'s a bust'
	let PLAYER_WINS_WITH_BLACKJACK = 'player wins with blackjack'
	let PLAYER_WINS_WITH_DEALER_BUST = 'player wins with dealer bust'
	let DEALER_WINS = 'dealer wins'
	let PLAYER_WINS = 'player wins'

	// Actions
	let HIT = 'hit'
	let STAY = 'stay'

	function createHandValueCalculator(cards) {
		function getValue() {
			let value = 0
			let numAces = 0

			if (!cards.length) return 0

			for (let card of cards) {
				switch (card.value) {
					case 1:
						numAces++
						break
					case 11:
					case 12:
					case 13:
						value += 10
						break
					default:
						value += card.value
				}
			}
			while (numAces--) {
				if (value + 11 > 21) value += 1
				else value += 11
			}
			return value
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
	} // <-- createHandWithValue

	function createHand() {
		let cards = []

		function addCard(card, faceDown = false) {
			if (faceDown)
				cards.push({
					suit: 'face-down',
					value: 0,
					face: card,
				})
			else
				cards.push(card)
		}

		function getCards() {
			return cards
		}

		function revealFaceDownCards() {
			for (let card of cards)
				if (card.suit == 'face-down') {
					Object.assign(card, card.face)
					delete card.face
				}
		}

		return {
			addCard,
			revealFaceDownCards,
			getCards,
		}
	} // <-- createHand

	function createPlayerHand() {
		let hand = createHand()
		let handValue = createHandValueCalculator(hand.getCards())

		return {
			...hand,
			...handValue,
		}
	} // <-- createPlayerHand

	function createDealerHand() {
		let hand = createHand()
		let handValue = createHandValueCalculator(hand.getCards())

		function addCard(card) {
			hand.addCard(card, hand.getCards().length == 1)
		}

		return {
			...hand,
			...handValue,
			addCard,
		}
	} // <-- createDealerHand

	function* createRound(deck) {
		// Use `return` to end the round
		// `yield` a game event to let the application take control

		let playerHand = createPlayerHand()
		let dealerHand = createDealerHand()
		let outcome = ''

		function createGameEvent(eventName) {
			return {
				event: eventName,
				dealerCards: dealerHand.getCards(),
				dealerHandValue: dealerHand.getValue(),
				playerCards: playerHand.getCards(),
				playerHandValue: playerHand.getValue(),
				outcome,
			}
		} // <-- createGameEvent

		// Start

		yield createGameEvent(NEW_ROUND)

		// Initial deal

		playerHand.addCard(deck.draw())
		yield createGameEvent(DEAL_TO_PLAYER)

		dealerHand.addCard(deck.draw())
		yield createGameEvent(DEAL_TO_DEALER)

		playerHand.addCard(deck.draw())
		yield createGameEvent(DEAL_TO_PLAYER)

		dealerHand.addCard(deck.draw(), true)
		yield createGameEvent(DEAL_TO_DEALER)

		if (playerHand.isBlackjack()) { // Blackjack or push?
			yield createGameEvent(PLAYER_HAS_BLACKJACK)

			dealerHand.revealFaceDownCards()
			yield createGameEvent(DEALER_REVEALS_HOLE)

			if (dealerHand.isBlackjack()) // push
				yield createGameEvent(ITS_A_PUSH)
			else
				yield createGameEvent(PLAYER_WINS_WITH_BLACKJACK)

			return
		}

		// Player's turn

		while (true) {
			let action = yield createGameEvent(PLAYERS_TURN)

			if (action != HIT) break

			playerHand.addCard(deck.draw())
			yield createGameEvent(DEAL_TO_PLAYER)
			if (playerHand.isBust()) {
				dealerHand.revealFaceDownCards()
				yield createGameEvent(DEALER_REVEALS_HOLE)
				yield createGameEvent(ITS_A_BUST)
				return
			}
		}

		// Dealer's turn

		yield createGameEvent(DEALERS_TURN)

		dealerHand.revealFaceDownCards()
		yield createGameEvent(DEALER_REVEALS_HOLE)

		while (dealerHand.getValue() < 17) {
			dealerHand.addCard(deck.draw())
			yield createGameEvent(DEAL_TO_DEALER)
		}

		// Final outcome

		if (dealerHand.isBust()) {
			yield createGameEvent(PLAYER_WINS_WITH_DEALER_BUST)
			return
		}

		if (dealerHand.getValue() > playerHand.getValue()) {
			yield createGameEvent(DEALER_WINS)
			return
		}

		if (dealerHand.getValue() < playerHand.getValue()) {
			yield createGameEvent(PLAYER_WINS)
			return
		}

		yield createGameEvent(ITS_A_PUSH)
	} // <-- createRound

	function createGame(eventHandler) {
		let deck = Deck.createDeck()
		let round = createRound(deck)

		function advance(command) {
			let playStatus = round.next(command)

			if (playStatus.done) {
				round = createRound(deck)
				advance()
				return
			}
			else eventHandler(playStatus.value)
		}

		return {
			advance,
		}
	} // <-- createGame

	return {
		createGame,

		NEW_ROUND,
		DEAL_TO_PLAYER,
		DEAL_TO_DEALER,
		PLAYER_HAS_BLACKJACK,
		DEALER_REVEALS_HOLE,
		PLAYERS_TURN,
		DEALERS_TURN,
		ITS_A_PUSH,
		ITS_A_BUST,
		PLAYER_WINS_WITH_BLACKJACK,
		PLAYER_WINS_WITH_DEALER_BUST,
		DEALER_WINS,
		PLAYER_WINS,
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
	gameFlow: Blackjack,
	elements: {
		region: document.getElementById('game-screen'),
		dealerCards: document.getElementById('dealer-cards'),
		dealerHandValue: document.getElementById('dealer-hand-value'),
		playerCards: document.getElementById('player-cards'),
		playerHandValue: document.getElementById('player-hand-value'),
		cardTemplate: document.querySelector('template[data-name=card]').content,
		playerActions: document.getElementById('player-actions'),
		outcome: document.getElementById('outcome'),
	},
})

function initialScreen(options) {
	let {elements, bus} = options

	elements.startGameTrigger.addEventListener('click', startGame)

	function startGame() {
		elements.region.hidden = true
		bus.send('startGame')
	}
} // <-- initialScreen

function gameScreen(options) {
	let PAUSE_FOR_MESSAGE = 5000

	let {elements, bus, gameFlow} = options
	let deck = Deck.createDeck()
	let game

	bus.on('startGame', startGame)

	elements.playerActions.addEventListener('click', performPlayerAction)

	function performPlayerAction(ev) {
		let action = ev.target.closest('button').value
		game.advance(action)
	}

	function advanceGameAfterPause() {
		setTimeout(game.advance, PAUSE_FOR_MESSAGE)
	}

	function startGame() {
		elements.region.hidden = false
		game = gameFlow.createGame(handleGameEvent)
		game.advance()
	}

	function handleGameEvent(gameState) {
		switch (gameState.event) {
			case gameFlow.NEW_ROUND:
				hidePlayerActions()
				clearMessage()
				renderPlayerHandValue(0)
				renderDealerHandValue(0)
				clearTable(game.advance)
				break

			case gameFlow.DEAL_TO_PLAYER:
				renderPlayerHandValue(gameState.playerHandValue)
				renderNextPlayerCard(gameState.playerCards.at(-1), game.advance)
				break

			case gameFlow.DEAL_TO_DEALER:
				renderDealerHandValue(gameState.dealerHandValue)
				renderNextDealerCard(gameState.dealerCards.at(-1), game.advance)
				break

			case gameFlow.DEALER_REVEALS_HOLE:
				renderDealerHandValue(gameState.dealerHandValue)
				revealHoleCard(gameState.dealerCards[1], game.advance)
				break

			case gameFlow.PLAYER_HAS_BLACKJACK:
				renderPlayerHasBlackjack()
				advanceGameAfterPause()
				break

			case gameFlow.PLAYER_WINS_WITH_BLACKJACK:
				renderPlayerWinsWithBlackjack()
				advanceGameAfterPause()
				break

			case gameFlow.ITS_A_PUSH:
				renderItsAPush()
				advanceGameAfterPause()
				break

			case gameFlow.PLAYERS_TURN:
				showPlayerActions()
				break

			case gameFlow.DEALERS_TURN:
				hidePlayerActions()
				game.advance()
				break

			case gameFlow.ITS_A_BUST:
				hidePlayerActions()
				renderPlayerBusts()
				advanceGameAfterPause()
				break

			case gameFlow.DEALERS_TURN:
				hidePlayerActions()
				break

			case gameFlow.PLAYER_WINS_WITH_DEALER_BUST:
				renderPlayerWinsWithDealerBust()
				advanceGameAfterPause()
				break

			case gameFlow.DEALER_WINS:
				renderDealerWins()
				advanceGameAfterPause()
				break

			case gameFlow.PLAYER_WINS:
				renderPlayerWins()
				advanceGameAfterPause()
				break
		}
	} // <-- handleGameEvent

	function clearTable(advance) {
		let cards = [...elements.region.querySelectorAll('[data-slot=card]')]
		!function removeCard() {
			let card = cards.shift()
			if (!card) advance()
			else card.animate([
				{transform: 'translate(0, 0)'},
				{transform: 'translate(-100vw, -100vh)'},
			], {duration: 400, easing: 'cubic-bezier(0.4, 0, 1, 0.7)'}).onfinish = function () {
				card.remove()
				removeCard()
			}
		}()
	}

	function renderNextDealerCard(card, advance) {
		if (card.suit == 'face-down') elements.dealerCards.append(renderFaceDownCard())
		else elements.dealerCards.append(renderFaceUpCard(card))
		animateCardDeal(elements.dealerCards.lastElementChild, advance)
	}

	function renderNextPlayerCard(card, advance) {
		elements.playerCards.append(renderFaceUpCard(card))
		animateCardDeal(elements.playerCards.lastElementChild, advance)
	}

	function animateCardDeal(cardNode, callback) {
		cardNode.animate([
			{transform: 'translate(100vw, -100vh)'},
			{transform: 'translate(0, 0)'},
		], {duration: 500, easing: 'cubic-bezier(0, 0.7, 0, 1)'}).onfinish = callback
	}

	function revealHoleCard(card, callback) {
		let cardNode = elements.dealerCards.querySelector('[data-facedown]')
		let cardFace = renderFaceUpCard(card)
		delete cardNode.dataset.facedown
		cardNode.animate([
			{zIndex: 1},
			{transform: `translateX(-5em) rotateY(90deg)`},
		], {duration: 200}).onfinish = function () {
			cardNode.replaceChildren(...cardFace.querySelector('[data-slot=card]').children)
			cardNode.animate([
				{transform: `translateX(-3em) rotateY(90deg)`},
				{transform: `none`},
			], {duration: 200}).onfinish = function () {
				callback()
			}
		}
	}

	function renderPlayerHandValue(value) {
		elements.playerHandValue.textContent = value
	}

	function renderDealerHandValue(value) {
		elements.dealerHandValue.textContent = value
	}

	function clearMessage() {
		outcome.textContent = ''
	}

	function renderPlayerHasBlackjack() {
		outcome.textContent = 'You have blackjack!'
	}

	function renderPlayerWinsWithBlackjack() {
		outcome.textContent = 'Blackjack, you win!'
	}

	function renderPlayerWinsWithDealerBust() {
		outcome.textContent = 'Dealer busted, you win!'
	}

	function renderPlayerWins() {
		outcome.textContent = 'You win!'
	}

	function renderDealerWins() {
		outcome.textContent = 'House wins'
	}

	function renderPlayerBusts() {
		outcome.textContent = 'It\'s a bust'
	}

	function renderItsAPush() {
		outcome.textContent = 'It\'s a push'
	}

	function renderFaceUpCard(card) {
		let cardNode = elements.cardTemplate.cloneNode(true)
		cardNode.querySelector('[data-slot=suit]').textContent = card.suit
		cardNode.querySelector('[data-slot=value]').textContent = formatCardValue(card.value)
		cardNode.querySelector('[data-slot=graphic]').setAttribute('href', getCardUrl(card))
		return cardNode
	}

	function renderFaceDownCard() {
		let cardNode = elements.cardTemplate.cloneNode(true)
		let cardSlot = cardNode.querySelector('[data-slot=card]')
		cardSlot.dataset.facedown = true
		cardNode.querySelector('[data-slot=desc]').textContent = 'face-down card'
		cardNode.querySelector('[data-slot=graphic]').setAttribute('href', 'cards.svg#card-back')
		return cardNode
	}

	function getCardUrl(card) {
		return 'cards.svg#card-' + card.suit + '-' + card.value
	}

	function hidePlayerActions() {
		elements.playerActions.hidden = true
	}

	function showPlayerActions() {
		elements.playerActions.hidden = false
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
} // <-- gameScreen