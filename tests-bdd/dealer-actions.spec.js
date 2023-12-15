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
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 4},
			// Hit
			{suit: 'spade', value: 11},
			// Dealer draws
			{suit: 'club', value: 9},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		let dealerCardList = await getDealerCardList(page)
		await expect(dealerCardList).toEqual([
			'9 of heart',
			'4 of spade',
			'9 of club',
		])
		await expect(page.getByText('Dealer busted, you win!')).toBeVisible()
	},
)

test(
	'When I stay, and dealer has a hand of 16 or less, and they do not bust after drawing, and they win of their hand is higher than mine',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 4},
			// Hit
			{suit: 'spade', value: 11},
			// Dealer draws
			{suit: 'diamond', value: 5},
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
			{suit: 'spade', value: 7},
			{suit: 'heart', value: 7},
			{suit: 'club', value: 2},
			{suit: 'spade', value: 2},
			// Hit
			{suit: 'spade', value: 9},
			// Dealer draws
			{suit: 'diamond', value: 9},
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
			{suit: 'spade', value: 7},
			{suit: 'heart', value: 7},
			{suit: 'club', value: 2},
			{suit: 'spade', value: 2},
			// Hit
			{suit: 'spade', value: 9},
			// Dealer draws
			{suit: 'diamond', value: 8},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		await expect(page.getByText('You win!')).toBeVisible()
	},
)

test(
	'When I stay, and dealer has a hand of 16 or less, and they do not bust, it\'s my win if my hand is higher',
	async function ({page, context}) {
		await rigTheDeck(context, [
			// Initial deal
			{suit: 'spade', value: 7},
			{suit: 'heart', value: 7},
			{suit: 'club', value: 2},
			{suit: 'spade', value: 2},
			// Hit
			{suit: 'spade', value: 9},
			// Dealer draws
			{suit: 'diamond', value: 8},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await page.getByRole('button', {name: 'Hit'}).click()
		await page.getByRole('button', {name: 'Stay'}).click()
		await expect(page.getByText('You win!')).toBeVisible()
	},
)
