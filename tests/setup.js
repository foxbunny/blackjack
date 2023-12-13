export default function setup(test) {
	test.beforeEach(async function ({page}) {
		await page.goto('/')
	})
}