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
	let PLAYER_WINS_WITH_BLACKJACK = 'player wins with blackjack'
	let ITS_A_PUSH = 'it\'s a push'

	function calculateHandValue(cards) {
		let lowValue = 0
		let highValue = 0

		for (let card of cards) switch (card.value) {
			case 1:
				lowValue += 1
				highValue += 11
				break
			case 11:
			case 12:
			case 13:
				lowValue += 10
				highValue += 10
				break
			default:
				lowValue += card.value
				highValue += card.value
		}

		if (highValue > 21) return lowValue
		else return highValue
	}

	function createHand() {
		let cards = []

		function addCard(card) {
			cards.push(card)
		}

		function getCards() {
			return cards
		}

		function getValue() {
			return calculateHandValue(cards)
		}

		return {
			addCard,
			getCards,
			getValue,
		}
	} // <-- createHand

	function createDealerHand() {
		let hand = createHand()

		let holeCard
		let holeShown = false

		function addCard(card) {
			if (hand.getCards().length == 1) holeCard = card
			else hand.addCard(card)
		}

		function getCards() {
			if (!holeCard) return hand.getCards()

			let [firstCard, ...otherCards] = hand.getCards()

			if (holeShown) return [firstCard, holeCard, ...otherCards]
			return [firstCard, {suit: 'hole'}, ...otherCards]
		}

		function revealHole() {
			holeShown = true
		}

		function getValue() {
			if (holeShown) return calculateHandValue([holeCard, ...hand.getCards()])
			return calculateHandValue(hand.getCards())
		}

		return {
			...hand,
			addCard,
			getCards,
			revealHole,
			getValue,
		}
	} // <-- createDealerHand

	function* createRound(deck) {
		let playerHand = createHand()
		let dealerHand = createDealerHand()
		let outcome = ''

		function createGameEvent(eventName) {
			return {
				event: eventName,
				dealerCards: dealerHand.getCards(),
				playerCards: playerHand.getCards(),
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

		dealerHand.addCard(deck.draw())
		yield createGameEvent(DEAL_TO_DEALER)

		if (playerHand.getValue() == 21) { // Blackjack or push?
			yield createGameEvent(PLAYER_HAS_BLACKJACK)

			dealerHand.revealHole()
			yield createGameEvent(DEALER_REVEALS_HOLE)

			if (dealerHand.getValue() == 21) // push
				yield createGameEvent(ITS_A_PUSH)
			else
				yield createGameEvent(PLAYER_WINS_WITH_BLACKJACK)
		}
		else { // Continue...
			yield createGameEvent(PLAYERS_TURN)
		}
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
		PLAYER_WINS_WITH_BLACKJACK,
		ITS_A_PUSH,
		PLAYERS_TURN,
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
		playerCards: document.getElementById('player-cards'),
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

	function handleGameEvent(gameState) {
		switch (gameState.event) {
			case gameFlow.NEW_ROUND:
				hidePlayerActions()
				game.advance()
				break

			case gameFlow.DEAL_TO_PLAYER:
				renderNextPlayerCard(gameState.playerCards.at(-1))
				game.advance()
				break

			case gameFlow.DEAL_TO_DEALER:
				renderNextDealerCard(gameState.dealerCards.at(-1))
				game.advance()
				break

			case gameFlow.DEALER_REVEALS_HOLE:
				revealHoleCard(gameState.dealerCards[1])
				game.advance()
				break

			case gameFlow.PLAYER_HAS_BLACKJACK:
				renderPlayerHasBlackjack()
				setTimeout(game.advance, PAUSE_FOR_MESSAGE)
				break

			case gameFlow.PLAYER_WINS_WITH_BLACKJACK:
				renderPlayerWinsWithBlackjack()
				setTimeout(game.advance, PAUSE_FOR_MESSAGE)
				break

			case gameFlow.ITS_A_PUSH:
				renderItsAPush()
				setTimeout(game.advance, PAUSE_FOR_MESSAGE)
				break

			case gameFlow.PLAYERS_TURN:
				showPlayerActions()
				break
		}
	} // <-- handleGameEvent

	function startGame() {
		elements.region.hidden = false
		game = gameFlow.createGame(handleGameEvent)
		game.advance()
	}

	function renderNextDealerCard(card) {
		if (card.suit == 'hole') elements.dealerCards.append(renderHole())
		else elements.dealerCards.append(renderCard(card))
	}

	function renderNextPlayerCard(card) {
		elements.playerCards.append(renderCard(card))
	}

	function revealHoleCard(card) {
		let holeCardNode = elements.dealerCards.querySelector('[data-facedown]')
		let realCard = renderCard(card)
		let cardSlot = realCard.querySelector('[data-slot=card]')
		cardSlot.dataset.facedown = true
		holeCardNode.replaceWith(cardSlot)
		requestAnimationFrame(function () {
			delete cardSlot.dataset.facedown
		})
	}

	function renderPlayerHasBlackjack() {
		outcome.textContent = 'You have blackjack!'
	}

	function renderPlayerWinsWithBlackjack() {
		outcome.textContent = 'Blackjack, you win!'
	}

	function renderItsAPush() {
		outcome.textContent = 'It\'s a push'
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