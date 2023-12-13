import {test, expect} from '@playwright/test'
import setup from './setup'

setup(test)

function getCardList(page, label) {
	return page.getByRole('region', {name: label}).getByRole('list')
}

test.beforeEach(async function ({context, page}) {
	// Patch Math.random() to make shuffling predictable
	await page.addInitScript(`{
		Math._random = Math.random
		let lastValue = false
		Math.random = function () {
			return Number(lastValue = !lastValue)
		}
	}`)

	await page.goto('/')
	await page.getByRole('button', {name: 'Start a new game'}).click()
})

test(
	'When I start a game, dealer deals two cards to me, and two cards to them',
	async function ({page, context}) {
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem')).toHaveCount(2)
		await expect(getCardList(page, 'Your hand').getByRole('listitem')).toHaveCount(2)
	},
)

test(
	'When the dealer deails the second card to themselves, it should be a hole',
	async function ({page, context}) {
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem').nth(0)).toHaveText('face-down card')
	},
)
