import {expect} from 'chai'
import {createBus} from './bus.js'

describe('Bus', function () {
	it('should let me add listeners', function () {
		let bus = createBus(new EventTarget())

		bus.on('foo', function () {})
	})

	it('should let me send messages to listeners', function () {
		let called = false
		let bus = createBus(new EventTarget())

		bus.on('foo', function () {
			called = true
		})
		bus.send('foo')

		expect(called).to.equal(true)
	})

	for (let value of [1, 'bar', {foo: 'bar'}, null])
		it('should pass a payload to the listener, like ' + JSON.stringify(value), function () {
			let payload
			let bus = createBus(new EventTarget())

			bus.on('foo', function (something) {
				 payload = something
			})
			bus.send('foo', value)

			expect(payload).to.equal(value)
		})
})
