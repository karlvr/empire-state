import { controllerWithInitialValue } from '../creators'

describe('slice', () => {
	it('can slice to return a shallow copy of a portion of an array', () => {
		interface TestInterface {
			children: {
				name: string
			}[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: [
				{ name: 'Peter' },
				{ name: 'Janet' },
				{ name: 'Pam' },
				{ name: 'Barbara' },
				{ name: 'Jack' },
				{ name: 'Colin' },
				{ name: 'George' },
			],
		})

		expect(controller.value.children.length).toEqual(7)

		const sliced1 = controller.slice('children', 0, 2)
		expect(sliced1).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Pam' },
			{ name: 'Barbara' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const childrenController = controller.get('children')
		const sliced2 = childrenController.slice(3, 6)
		expect(sliced2).toEqual([
			{ name: 'Barbara' },
			{ name: 'Jack' },
			{ name: 'Colin' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Pam' },
			{ name: 'Barbara' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const sliced3 = childrenController.slice(4)
		expect(sliced3).toEqual([
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const sliced4 = childrenController.slice()
		expect(sliced4).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Pam' },
			{ name: 'Barbara' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const sliced5 = childrenController.slice(-4)
		expect(sliced5).toEqual([
			{ name: 'Barbara' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const sliced6 = childrenController.slice(2, -2)
		expect(sliced6).toEqual([
			{ name: 'Pam' },
			{ name: 'Barbara' },
			{ name: 'Jack' },
		])
	})

})
