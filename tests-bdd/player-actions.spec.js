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
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
			{suit: 'spades', value: 3},
		])
		await startGame(page)
		await page.getByRole('button', {name: 'Hit'}).click()
		let playerCards = await getPlayerCardList(page)
		await expect(playerCards).toEqual([
			'2 of spades',
			'ace of clubs',
			'3 of spades',
		])
		await expect(page.getByText('Player\'s hand: 16')).toBeVisible()
	},
)

test(
	'When I hit and go over 21, I am bust',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
			{suit: 'spades', value: 11},
			{suit: 'hearts', value: 9},
		])
		await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Hit'}).click()
		await expect(page.getByText('Player\'s hand: 22')).toBeVisible()
		await expect(page.getByText('It\'s a bust')).toBeVisible()
		await expect(page.getByRole('button', {name: 'Hit'})).toBeHidden()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeHidden()
	},
)

test(
	'When I bust, a new round starts shortly',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
			// Hits
			{suit: 'spades', value: 11},
			{suit: 'hearts', value: 9},
			// Next round
			{suit: 'clubs', value: 2},
			{suit: 'diamonds', value: 3},
			{suit: 'spades', value: 4},
			{suit: 'diamonds', value: 1},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Hit'}).click()
		await expect(page.getByText('It\'s a bust')).toBeVisible()
		await runTimers()
		await expect(await getPlayerCardList(page)).toHaveLength(2)
		await expect(await getDealerCardList(page)).toHaveLength(2)
	},
)
