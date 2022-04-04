import { controllerWithInitialValue } from '../creators'

describe('push', () => {
	it('can push a value in a string array property', () => {
		interface TestInterface {
			children: string[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: ['Peter', 'Janet', 'Pam'],
		})

		controller.push('children', 'Barbara')

		expect(controller.value.children).toBeDefined()
		expect(controller.value.children.length).toBe(4)
		expect(controller.value.children).toEqual(['Peter', 'Janet', 'Pam', 'Barbara'])
	})

	it('can push a value in an object array property', () => {
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
			],
		})

		controller.push('children', { name: 'Barbara' })

		expect(controller.value.children).toBeDefined()
		expect(controller.value.children.length).toBe(4)
		expect(controller.value.children).toEqual([
			{ name: 'Peter' },
			{ name: 'Janet' },
			{ name: 'Pam' },
			{ name: 'Barbara' },
		])
	})

	it('can push a value in an undefined array property', () => {
		interface TestInterface {
			children?: string[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: undefined,
		})

		expect(controller.value.children).toBeUndefined()

		controller.push('children', 'Barbara')

		expect(controller.value.children).toBeDefined()
		expect(controller.value.children!.length).toBe(1)
		expect(controller.value.children).toEqual(['Barbara'])
	})

})
