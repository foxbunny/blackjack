import {expect} from 'chai'
import {createHandValueCalculator} from './hand-value.js'

describe('HandValue', function () {
	for (let i = 2; i < 10; i++)
		it(`should treat a number card as its face value, like ${i}`, function () {
			let value = createHandValueCalculator([{suit: 'spades', value: i}])

			expect(value.getValue()).to.equal(i)
		})

	for (let i = 11; i < 14; i++)
		it(`should treat any face card, like ${i}, as a 10`, function () {
			let value = createHandValueCalculator([{suit: 'spades', value: i}])

			expect(value.getValue()).to.equal(10)
		})

	it('should count the ace as 11 when total is below 21', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
		])

		expect(value.getValue()).to.equal(20)
	})

	it('should count the ace as a 1 when the total would go over 21 otherwise', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 9},
			{suit: 'spades', value: 11},
			{suit: 'clubs', value: 1},
		])

		expect(value.getValue()).to.equal(20)
	})

	it('should tell me when the hand is a blackjack', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 13},
			{suit: 'clubs', value: 1},
		])

		expect(value.isBlackjack()).to.equal(true)
	})

	it('should tell me when the hand is not a blackjack', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 13},
			{suit: 'clubs', value: 2},
		])

		expect(value.isBlackjack()).to.equal(false)
	})

	it('should tell me when the hand is a bust', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 13},
			{suit: 'clubs', value: 10},
			{suit: 'spades', value: 3},
		])

		expect(value.isBust()).to.equal(true)
	})

	it('should tell me when the hand is not a bust', function () {
		let value = createHandValueCalculator([
			{suit: 'hearts', value: 13},
			{suit: 'clubs', value: 10},
		])

		expect(value.isBust()).to.equal(false)
	})
})