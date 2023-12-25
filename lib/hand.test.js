import {expect} from 'chai'
import {createHand} from './hand.js'

describe('Hand', function () {
	it('should let me add a card', function () {
		let hand = createHand()

		hand.addCard({suit: 'hearts', value: 1})
	})

	it('should let me retrieve added cards', function () {
		let hand = createHand()

		hand.addCard({suit: 'hearts', value: 1})

		expect(hand.getCards()).to.deep.equal([{suit: 'hearts', value: 1}])
	})

	it('should let me retrieve cards in the same order in which they were added', function () {
		let hand = createHand()

		hand.addCard({suit: 'spades', value: 6})
		hand.addCard({suit: 'hearts', value: 1})
		hand.addCard({suit: 'clubs', value: 2})

		expect(hand.getCards()).to.deep.equal([
			{suit: 'spades', value: 6},
			{suit: 'hearts', value: 1},
			{suit: 'clubs', value: 2},
		])
	})

	it('should let me add cards face-down', function () {
		let hand = createHand()

		hand.addCard({suit: 'spades', value: 6}, true)

		expect(hand.getCards()[0]).to.deep.equal({
			suit: 'face-down',
			value: 0,
			actual: {suit: 'spades', value: 6},
		})
	})

	it('should let me reveal a face-down card', function () {
		let hand = createHand()

		hand.addCard({suit: 'spades', value: 6}, true)
		hand.revealFaceDownCards()

		expect(hand.getCards()[0]).to.deep.equal({
			suit: 'spades',
			value: 6,
		})
	})

	it('should reveal a face-down card regardless of its position', function () {
		let hand = createHand()

		hand.addCard({suit: 'hearts', value: 1})
		hand.addCard({suit: 'spades', value: 6}, true)
		hand.revealFaceDownCards()

		expect(hand.getCards()[1]).to.deep.equal({
			suit: 'spades',
			value: 6,
		})
	})
})