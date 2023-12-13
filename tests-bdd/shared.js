import path from 'node:path'
import url from 'node:url'
import {fileURLToPath} from 'url'
import shuffledDeck from './fixtures/shuffled-deck.json'
import unshuffledDeck from './fixtures/unshuffled-deck.json'

let mocksDir = path.resolve(__dirname, '..', 'mocks')

export function getCardList(page, label) {
	return page.getByRole('region', {name: label}).getByRole('list')
}

export async function rigTheDeck(context, cards) {
	await context.addInitScript(function (cards) {
		window.__TEST_DECK = cards
	}, cards)
}

export async function startGame(page) {
	// Shorten the timeout for faster tests
	await page.addInitScript(`{
		let setTimeoutOrig = setTimeout
		window.setTimeout = function (callback, timeout, ...args) {
			setTimeoutOrig(callback, 1, ...args)
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
}

export {
	shuffledDeck,
	unshuffledDeck,
}
