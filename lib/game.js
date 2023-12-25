import {createDeck} from './deck.js'
import {createHandValueCalculator} from './hand-value.js'
import {createHand} from './hand.js'

export let NEW_ROUND = 'new round'
export let DEAL_TO_PLAYER = 'deal to player'
export let DEAL_TO_DEALER = 'deal to dealer'
export let PLAYER_HAS_BLACKJACK = 'player has backjack'
export let DEALER_REVEALS_HOLE = 'dealer reveals hole'
export let PLAYERS_TURN = 'player\'s turn'
export let DEALERS_TURN = 'dealer\'s turn'
export let ITS_A_PUSH = 'it\'s a push'
export let ITS_A_BUST = 'it\'s a bust'
export let PLAYER_WINS_WITH_BLACKJACK = 'player wins with blackjack'
export let PLAYER_WINS_WITH_DEALER_BUST = 'player wins with dealer bust'
export let DEALER_WINS = 'dealer wins'
export let PLAYER_WINS = 'player wins'

export let HIT = 'hit'
export let STAY = 'stay'

function createPlayerHand() {
	let hand = createHand()
	let value = createHandValueCalculator(hand.getCards())

	return {
		...hand,
		...value,
	}
}

function createDealerHand() {
	let hand = createHand()
	let value = createHandValueCalculator(hand.getCards())

	function addCard(card) {
		hand.addCard(card, hand.getCards().length == 1)
	}

	return {
		...hand,
		...value,
		addCard,
	}
}

function* createRound(deck) {
	let playerHand = createPlayerHand()
	let dealerHand = createDealerHand()

	function createEvent(event) {
		return {
			event,
			playerCards: playerHand.getCards(),
			playerValue: playerHand.getValue(),
			dealerCards: dealerHand.getCards(),
			dealerValue: dealerHand.getValue(),
		}
	}

	yield createEvent(NEW_ROUND)

	playerHand.addCard(deck.draw())
	yield createEvent(DEAL_TO_PLAYER)

	dealerHand.addCard(deck.draw())
	yield createEvent(DEAL_TO_DEALER)

	playerHand.addCard(deck.draw())
	yield createEvent(DEAL_TO_PLAYER)

	dealerHand.addCard(deck.draw())
	yield createEvent(DEAL_TO_DEALER)

	if (playerHand.isBlackjack()) {
		yield createEvent(PLAYER_HAS_BLACKJACK)

		dealerHand.revealFaceDownCards()
		yield createEvent(DEALER_REVEALS_HOLE)

		if (dealerHand.isBlackjack()) yield createEvent(ITS_A_PUSH)
		else yield createEvent(PLAYER_WINS_WITH_BLACKJACK)

		return
	}

	while (true) {
		let action = yield createEvent(PLAYERS_TURN)

		if (action != HIT) break

		playerHand.addCard(deck.draw())
		yield createEvent(DEAL_TO_PLAYER)

		if (playerHand.isBust()) {
			dealerHand.revealFaceDownCards()
			yield createEvent(DEALER_REVEALS_HOLE)

			yield createEvent(ITS_A_BUST)
			return
		}
	}

	yield createEvent(DEALERS_TURN)

	dealerHand.revealFaceDownCards()
	yield createEvent(DEALER_REVEALS_HOLE)

	while (dealerHand.getValue() < 17) {
		dealerHand.addCard(deck.draw())
		yield createEvent(DEAL_TO_DEALER)
	}

	if (dealerHand.isBust()) {
		yield createEvent(PLAYER_WINS_WITH_DEALER_BUST)
		return
	}

	if (dealerHand.getValue() == playerHand.getValue()) {
		yield createEvent(ITS_A_PUSH)
		return
	}

	if (dealerHand.getValue() > playerHand.getValue()) {
		yield createEvent(DEALER_WINS)
		return
	}

	yield createEvent(PLAYER_WINS)
}

export function createGame(eventListener, deck = createDeck()) {
	let round = createRound(deck)

	function advance(action) {
		let event = round.next(action)
		if (event.done) {
			round = createRound(deck)
			event = round.next()
		}
		eventListener(event.value)
	}

	return {
		advance,
	}
}