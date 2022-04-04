import { controllerWithInitialValue } from '../creators'

describe('remove', () => {
	it('can remove a value in an array property', () => {
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

		controller.remove('children', (value, index) => {
			return value.name === 'Colin'
		})

		expect(controller.value).toBeDefined()
		expect(controller.value.children.length).toEqual(6)
	})
	it('works when a value doesn\'t exist in an array property', () => {
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
		controller.remove('children', (value, index) => {
			return value.name === 'Anne'
		})
		expect(controller.value.children.length).toEqual(7)
	})

	it('can remove a value in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		expect(controller.value.indexOf('George')).not.toBe(-1)
		controller.remove('this', (value, index) => {
			return value === 'George'
		})
		expect(controller.value.indexOf('George')).toBe(-1)
	})

	it('works when the value doesn\'t exist in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		expect(controller.value.length).toEqual(5)
		controller.remove('this', (value, index) => {
			return value === 'Chuck'
		})
		expect(controller.value.length).toEqual(5)
	})

	it('works when the array is undefined', () => {
		const controller = controllerWithInitialValue<string[] | undefined>(undefined)

		controller.remove('this', (value, index) => {
			return value === 'Chuck'
		})
		expect(controller.value).toBeUndefined()
	})

})
