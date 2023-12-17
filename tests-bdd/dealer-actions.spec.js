import {expect, test} from '@playwright/test'
import {getCardListAsText, rigTheDeck, startGame} from './shared.js'

function getDealerCardList(page) {
	return getCardListAsText(page, 'Dealer\'s hand')
}

test(
	'When I stay, and the dealer has a hand of 16 or less, the dealer daws until they bust',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 4},
			// Hit
			{suit: 'spades', value: 11},
			// Dealer draws
			{suit: 'clubs', value: 9},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		let dealerCardList = await getDealerCardList(page)
		await expect(dealerCardList).toEqual([
			'9 of hearts',
			'4 of spades',
			'9 of clubs',
		])
		await expect(page.getByText('Dealer busted, you win!')).toBeVisible()
	},
)

test(
	'When I stay, and dealer has a hand of 16 or less, and they do not bust after drawing, and they win of their hand is higher than mine',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 4},
			// Hit
			{suit: 'spades', value: 11},
			// Dealer draws
			{suit: 'diamonds', value: 5},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		await expect(page.getByText('House wins')).toBeVisible()
	},
)

test(
	'When I stay, and dealer has a hand of 16 or less, and they do not bust, it\'s a push when we both have the same hand values',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spades', value: 7},
			{suit: 'hearts', value: 7},
			{suit: 'clubs', value: 2},
			{suit: 'spades', value: 2},
			// Hit
			{suit: 'spades', value: 9},
			// Dealer draws
			{suit: 'diamonds', value: 9},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		await expect(page.getByText('It\'s a push')).toBeVisible()
	},
)

test(
	'When I stay, and dealer has a hand of 16 or less, and they do not bust, it\'s my win if my hand is higher',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spades', value: 7},
			{suit: 'hearts', value: 7},
			{suit: 'clubs', value: 2},
			{suit: 'spades', value: 2},
			// Hit
			{suit: 'spades', value: 9},
			// Dealer draws
			{suit: 'diamonds', value: 8},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		await expect(page.getByText('You win!')).toBeVisible()
	},
)
