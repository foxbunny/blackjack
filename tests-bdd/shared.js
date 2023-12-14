import path from 'node:path'
import url from 'node:url'
import shuffledDeck from './fixtures/shuffled-deck.json' assert {type: 'json'}
import unshuffledDeck from './fixtures/unshuffled-deck.json' assert {type: 'json'}

let __dirname = path.dirname(url.fileURLToPath(import.meta.url))
let mocksDir = path.resolve(__dirname, '..', 'mocks')

export function getCardList(page, label) {
	return page.getByRole('region', {name: label}).getByRole('list')
}

export async function rigTheDeck(context, cards) {
	await context.addInitScript(function (cards) {
		window.__TEST_DECK = cards
	}, cards)
}

export async function startGame(page, options = {}) {
	// Shorten the timeout for faster tests
	await page.addInitScript(`{
		let _setTimeout = setTimeout
		let timersStopped = ${!!options?.stopTimers}
		let timerCallbacks = []
		window.__runTimers = function () {
			// NB: Copy because executing a callback may run code that adds new timers
			let timersToRun = [...timerCallbacks]
			for (let {callback, args} of timersToRun) callback(...args)
		}
		window.setTimeout = function (callback, _ignored, ...args) {
			if (timersStopped)
				timerCallbacks.push({callback, args}) 
			else 
				// NB: Speed up timeouts by using 1ms delay
				_setTimeout(callback, 1, ...args)
		}
	}`)

	// Patch the deck module
	await page.route('/deck.js', async function (route) {
		await route.fulfill({
			path: path.join(mocksDir, 'deck.js'),
		})
	})

	// Go to the page and start the game
	await page.goto('/')
	await page.getByRole('button', {name: 'Start a new game'}).click()

	async function runTimers() {
		await page.evaluate(`__runTimers()`)
	}

	return {
		runTimers,
	}
}

export {
	shuffledDeck,
	unshuffledDeck,
}
