import {expect} from 'chai'
import * as Game from './game.js'
import {createDeck} from '../mocks/deck.js'

function createGame(cards) {
	let deck = createDeck(cards)
	let events = []
	let game = Game.createGame(function (event) {
		events.push(event)
	}, deck)


	function getLastEvent() {
		 return events.at(-1)
	}

	function advanceNSteps(n) {
		while (n--) game.advance()
	}

	function advanceUntilEvent(eventName) {
		while (true) {
			game.advance()
			let event = getLastEvent()
			if (!event || event.event == eventName) return
		}
	}

	function advanceWithAction(action) {
		game.advance(action)
	}

	return {
		getLastEvent,
		advanceNSteps,
		advanceUntilEvent,
		advanceWithAction,
	}
}

describe('Game', function () {
	it('should let me start a new game', function() {
		let game = createGame([])

		game.advanceUntilEvent(Game.NEW_ROUND)

		expect(game.getLastEvent().event).to.equal(Game.NEW_ROUND)
	})

	it('shoud deal a card to the player first', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
		])

		game.advanceUntilEvent(Game.DEAL_TO_PLAYER)

		expect(game.getLastEvent().event).to.equal(Game.DEAL_TO_PLAYER)
		expect(game.getLastEvent().playerCards).to.deep.equal([
			{suit: 'clubs', value: 1},
		])
		expect(game.getLastEvent().playerValue).to.equal(11)
	})

	it('should deal to the dealer after dealing to the player', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
		])

		game.advanceNSteps(3)

		expect(game.getLastEvent().event).to.equal(Game.DEAL_TO_DEALER)
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
		])
	})

	it('should deal 4 cards and the last dealer\'s card should be face-down', function () {
		let game = createGame([
				{suit: 'clubs', value: 1},
				{suit: 'clubs', value: 2},
				{suit: 'clubs', value: 3},
				{suit: 'clubs', value: 4},
		])

		game.advanceNSteps(5)

		expect(game.getLastEvent().event).to.equal(Game.DEAL_TO_DEALER)
		expect(game.getLastEvent().playerCards).to.deep.equal([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 3},
		])
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
			{suit: 'face-down', value: 0, actual: {suit: 'clubs', value: 4}},
		])
	})

	it('should wait for the player\'s turn after dealing', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)

		expect(game.getLastEvent().event).to.equal(Game.PLAYERS_TURN)
	})

	it('should tell me I have a blackjack if my hand is 21 after the initial deal', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.PLAYER_HAS_BLACKJACK)

		expect(game.getLastEvent().event).to.equal(Game.PLAYER_HAS_BLACKJACK)
	})

	it('when I have blackjack, dealer should reveal the hole card', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.DEALER_REVEALS_HOLE)

		expect(game.getLastEvent().event).to.equal(Game.DEALER_REVEALS_HOLE)
	})

	it('should grant me victory if I have blackjack and dealer does not', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.PLAYER_WINS_WITH_BLACKJACK)

		expect(game.getLastEvent().event).to.equal(Game.PLAYER_WINS_WITH_BLACKJACK)
	})

	it('should be a push if both me and the dealer have blackjack', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'hearts', value: 1},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 11},
		])

		game.advanceUntilEvent(Game.ITS_A_PUSH)

		expect(game.getLastEvent().event).to.equal(Game.ITS_A_PUSH)
	})

	it('should let me hit', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.HIT)

		expect(game.getLastEvent().event).to.equal(Game.DEAL_TO_PLAYER)
		expect(game.getLastEvent().playerCards).to.deep.equal([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 5},
		])
	})

	it('should be a bust if I hit and go over 21', function () {
		let game = createGame([
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 11},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.HIT)
		game.advanceUntilEvent(Game.ITS_A_BUST)

		expect(game.getLastEvent().event).to.equal(Game.ITS_A_BUST)
		expect(game.getLastEvent().playerCards).to.deep.equal([
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 11},
		])
	})

	it('should let me stay, in which case it is dealer\'s turn', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)

		expect(game.getLastEvent().event).to.equal(Game.DEALERS_TURN)
	})

	it('should let me stay, after which the dealer turns their hole card', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.DEALER_REVEALS_HOLE)

		expect(game.getLastEvent().event).to.equal(Game.DEALER_REVEALS_HOLE)
	})

	it('should make the dealer hit after I satay if their hand is 16 or lower', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.DEAL_TO_DEALER)

		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
		])
	})

	it('should be a dealer win if I stay and dealer hits until they get a higher hand', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.DEALER_WINS)

		expect(game.getLastEvent().event).to.equal(Game.DEALER_WINS)
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		])
	})

	it('should be my win if I stay and dealer does not draw a higher hand', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 9},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.PLAYER_WINS)

		expect(game.getLastEvent().event).to.equal(Game.PLAYER_WINS)
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		])
	})

	it('should be a push if I stay and dealer draws the same hand as me', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 9},
			{suit: 'clubs', value: 8},
			{suit: 'clubs', value: 10},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.ITS_A_PUSH)

		expect(game.getLastEvent().event).to.equal(Game.ITS_A_PUSH)
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 8},
			{suit: 'clubs', value: 10},
		])
	})

	it('should be my win if I stay and dealer busts while hitting', function () {
		let game = createGame([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 6},
			{suit: 'clubs', value: 11},
		])

		game.advanceUntilEvent(Game.PLAYERS_TURN)
		game.advanceWithAction(Game.STAY)
		game.advanceUntilEvent(Game.PLAYER_WINS_WITH_DEALER_BUST)

		expect(game.getLastEvent().event).to.equal(Game.PLAYER_WINS_WITH_DEALER_BUST)
		expect(game.getLastEvent().dealerCards).to.deep.equal([
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 6},
			{suit: 'clubs', value: 11},
		])
	})

	for (let deck of [
		Object.assign([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 10},
			{suit: 'clubs', value: 4},
		], {label: 'blackjack'}),
		Object.assign([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 3},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		], {label: 'dealer wins'}),
		Object.assign([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 9},
			{suit: 'clubs', value: 4},
			{suit: 'clubs', value: 5},
			{suit: 'clubs', value: 6},
		], {label: 'player wins'}),
		Object.assign([
			{suit: 'clubs', value: 1},
			{suit: 'clubs', value: 2},
			{suit: 'clubs', value: 9},
			{suit: 'clubs', value: 8},
			{suit: 'clubs', value: 10},
		], {label: 'push'})
	])
		it('should start a new round after a round ends with an outcome like ' + deck.label, function () {
			let game = createGame(deck)

			game.advanceNSteps(1)
			game.advanceUntilEvent(Game.NEW_ROUND)

			expect(game.getLastEvent().event).to.equal(Game.NEW_ROUND)
		})
})