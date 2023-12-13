import {test, expect} from '@playwright/test'

test(
	'When I open the game, I see a start button',
	async function ({page}) {
		await page.goto('/')
		await expect(page.getByRole('button', {name: 'Start a new game'}))
			.toBeVisible()
	},
)

test(
	'When I click "Start a new game" the table appears',
	async function ({page}) {
		await page.goto('/')
		await page.getByRole('button', {name: 'Start a new game'}).click()
		await expect(page.getByLabel('Table')).toBeVisible()
	},
)