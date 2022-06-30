import { controllerWithInitialValue } from '../creators'

describe('splice', () => {
	it('can splice to remove a value in an array property', () => {
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

		const spliced1 = controller.splice('children', 2, 2)
		expect(spliced1).toEqual([
			{ name: 'Pam' },
			{ name: 'Barbara' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const childrenController = controller.get('children')
		const spliced2 = childrenController.splice(1, 1)
		expect(spliced2).toEqual([
			{ name: 'Janet' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Jack' },
			{ name: 'Colin' },
			{ name: 'George' },
		])
	})

	it('can splice to remove and insert values in an array property', () => {
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

		const spliced1 = controller.splice('children', 2, 3, { name: 'Paul' }, { name: 'Mary' })
		expect(spliced1).toEqual([
			{ name: 'Pam' },
			{ name: 'Barbara' },
			{ name: 'Jack' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Paul' },
			{ name: 'Mary' },
			{ name: 'Colin' },
			{ name: 'George' },
		])

		const childrenController = controller.get('children')
		const spliced2 = childrenController.splice(4, 3, { name: 'Tulip' })
		expect(spliced2).toEqual([
			{ name: 'Colin' },
			{ name: 'George' },
		])

		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Paul' },
			{ name: 'Mary' },
			{ name: 'Tulip' },
		])
	})

	it('can splice into an undefined array', () => {
		const controller = controllerWithInitialValue<string[] | undefined>(undefined)
		controller.splice(0, 0, 'Hello', 'World')
		expect(controller.value).toEqual(['Hello', 'World'])
	})

	it('can splice to delete remainder of array', () => {
		const controller = controllerWithInitialValue<string[]>(['Peter', 'Janet', 'Pam', 'Barbara'])
		controller.splice(2)
		expect(controller.value).toEqual(['Peter', 'Janet'])
	})

})
