import * as Deck from './lib/deck.js'
import * as Game from './lib/game.js'
import {createBus} from './lib/bus.js'

let Bus = createBus(new EventTarget())

initialScreen({
	bus: Bus,
	elements: {
		region: document.getElementById('initial-screen'),
		startGameTrigger: document.getElementById('start-game'),
	},
})
gameScreen({
	bus: Bus,
	gameFlow: Game,
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
				renderPlayerHandValue(gameState.playerValue)
				renderNextPlayerCard(gameState.playerCards.at(-1), game.advance)
				break

			case gameFlow.DEAL_TO_DEALER:
				renderDealerHandValue(gameState.dealerValue)
				renderNextDealerCard(gameState.dealerCards.at(-1), game.advance)
				break

			case gameFlow.DEALER_REVEALS_HOLE:
				renderDealerHandValue(gameState.dealerValue)
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
	} // <-- revealHoleCard

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
	} // <-- formatCardValue
} // <-- gameScreen