import {expect} from 'chai'
import {createDeck} from './deck.js'

describe('Deck', function () {
	it('shuould let me draw a card', function () {
		let deck = createDeck()
		let card = deck.draw()
		expect(card.suit).to.be.a('string')
		expect(card.value).to.be.a('number')
	})

	it('should let me draw a different card every time', function () {
		let deck = createDeck()
		let previouslySeenCards = new Set()
		for (let i = 0; i++ < 52;) {
			let card = deck.draw()
			let key = card.suit + card.value
			expect(previouslySeenCards).not.to.include(key)
			previouslySeenCards.add(key)
		}
	})

	it('should give me more than 52 cards', function () {
		let deck = createDeck()
		for (let i = 52; i--;) deck.draw()
		expect(deck.draw()).not.to.be.a('undefined')
	})

	it('should give me a different deck every shuffle', function () {
		let deck = createDeck()

		function stringifyDeck() {
			let s = ''
			for (let i = 52; i--;) {
				let card = deck.draw()
				s += card.suit + card.value
			}
			return s
		}

		let s1 = stringifyDeck()
		let s2 = stringifyDeck()
		let s3 = stringifyDeck()

		expect(s1).not.to.equal(s2)
		expect(s2).not.to.equal(s3)
	})
})