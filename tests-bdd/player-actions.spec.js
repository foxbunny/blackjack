import {test, expect} from '@playwright/test'
import {startGame, rigTheDeck, getCardListAsText, getCardList} from './shared'

function getPlayerCardList(page) {
	return getCardListAsText(page, 'Your hand')
}

function getDealerCardList(page) {
	return getCardListAsText(page, 'Dealer\'s hand')
}

test(
	'When I choose to hit, I get dealt a new card',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
			{suit: 'spade', value: 3},
		])
		await startGame(page)
		await page.getByRole('button', {name: 'Hit'}).click()
		let playerCards = await getPlayerCardList(page)
		await expect(playerCards).toEqual([
			'2 of spade',
			'ace of club',
			'3 of spade',
		])
		await expect(page.getByText('Player: 16')).toBeVisible()
	},
)

test(
	'When I hit and go over 21, I am bust',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
			{suit: 'spade', value: 11},
			{suit: 'heart', value: 9},
		])
		await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Hit'}).click()
		await expect(page.getByText('It\'s a bust')).toBeVisible()
		await expect(page.getByText('Player: 22')).toBeVisible()
		await expect(page.getByRole('button', {name: 'Hit'})).toBeHidden()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeHidden()
	},
)

test(
	'When I bust, a new round starts shortly',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
			// Hits
			{suit: 'spade', value: 11},
			{suit: 'heart', value: 9},
			// Next round
			{suit: 'club', value: 2},
			{suit: 'diamond', value: 3},
			{suit: 'spade', value: 4},
			{suit: 'diamond', value: 1},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Hit'}).click()
		await expect(page.getByText('It\'s a bust')).toBeVisible()
		await runTimers()
		await expect(await getPlayerCardList(page)).toHaveLength(2)
		await expect(await getDealerCardList(page)).toHaveLength(2)
		await expect(page.getByText('It\'s a bust')).toBeHidden()
	},
)
