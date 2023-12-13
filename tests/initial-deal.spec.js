import {test, expect} from '@playwright/test'
import {getCardList, startGame, rigTheDeck} from './shared'

test(
	'When I start a game, dealer deals two cards to me, and two cards to them',
	async function ({page, context}) {
		rigTheDeck(context, [
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
		])
		await startGame(page)
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem')).toHaveCount(2)
		await expect(getCardList(page, 'Your hand').getByRole('listitem')).toHaveCount(2)
	},
)

test(
	'When the dealer deails the second card to themselves, it should be a hole',
	async function ({page, context}) {
		rigTheDeck(context, [
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
		])
		await startGame(page)
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem').nth(0)).toHaveText('9 of heart')
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem').nth(1)).toHaveText('face-down card')
	},
)

test(
	'When the dealer deals the cards, I can choose to either hit or stay',
	async function ({page, context}) {
		rigTheDeck(context, [
			{suit: 'spade', value: 2},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
		])
		await startGame(page)
		await expect(page.getByRole('button', {name: 'Hit'})).toBeVisible()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeVisible()
	},
)

test(
	'When the dealer deals the cards, and I get a blackjack, I win if the dealer does not get a blackjack',
	async function ({page, context}) {
		rigTheDeck(context, [
			{suit: 'spade', value: 13},
			{suit: 'heart', value: 9},
			{suit: 'club', value: 1},
			{suit: 'spade', value: 12},
		])
		await startGame(page)
		await expect(page.getByRole('button', {name: 'Hit'})).toBeHidden()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeHidden()
		await expect(page.getByText('Blackjack, you win!')).toBeVisible()
	},
)