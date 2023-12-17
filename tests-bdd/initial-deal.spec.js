import {test, expect} from '@playwright/test'
import {getCardList, startGame, rigTheDeck} from './shared'

test(
	'When I start a game, dealer deals two cards to me, and two cards to them',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		await startGame(page)
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem')).toHaveCount(2)
		await expect(getCardList(page, 'Your hand').getByRole('listitem')).toHaveCount(2)
	},
)

test(
	'When the dealer deails the second card to themselves, it should be a hole',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		await startGame(page)
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem').nth(0)).toHaveText('9 of hearts')
		await expect(getCardList(page, 'Dealer\'s hand').getByRole('listitem').nth(1)).toHaveText('face-down card')
	},
)

test(
	'When the dealer deals the cards, I can choose to either hit or stay',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		await startGame(page)
		await expect(page.getByRole('button', {name: 'Hit'})).toBeVisible()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeVisible()
	},
)

test(
	'When the dealer deals the cards, I can see mine and the dealer\'s scores.',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 2},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		await startGame(page)
		await expect(page.getByText('Dealer: 9')).toBeVisible()
		await expect(page.getByText('Player: 13')).toBeVisible()
	},
)

test(
	'When the dealer deals the cards, and I get a blackjack, I win if the dealer does not get a blackjack',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 13},
			{suit: 'hearts', value: 9},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await expect(page.getByText('You have blackjack!')).toBeVisible()
		await runTimers()
		await expect(page.getByRole('button', {name: 'Hit'})).toBeHidden()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeHidden()
		await expect(page.getByText('Blackjack, you win!')).toBeVisible()
	},
)

test(
	'When the dealer deals the cards, and I both the dealer and I get blackjacks, it\'s a push.',
	async function ({page, context}) {
		await rigTheDeck(context, [
			{suit: 'spades', value: 13},
			{suit: 'hearts', value: 1},
			{suit: 'clubs', value: 1},
			{suit: 'spades', value: 12},
		])
		let {runTimers} = await startGame(page, {stopTimers: true})
		await expect(page.getByText('You have blackjack!')).toBeVisible()
		await runTimers()
		await expect(page.getByRole('button', {name: 'Hit'})).toBeHidden()
		await expect(page.getByRole('button', {name: 'Stay'})).toBeHidden()
		await expect(page.getByText('It\'s a push')).toBeVisible()
	},
)