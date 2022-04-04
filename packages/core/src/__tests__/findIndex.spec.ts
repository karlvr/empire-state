import { controllerWithInitialValue } from '../creators'

describe('map', () => {
	it('can find a value in an array property', () => {
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

		const colin = controller.findIndex('children', (value, index) => {
			return value.name === 'Colin'
		})

		expect(colin).toEqual(5)
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

		const index = controller.findIndex('children', (value, index) => {
			return value.name === 'Anne'
		})

		expect(index).toEqual(-1)
	})

	it('can find a value in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		const index = controller.findIndex((value, index) => {
			return value === 'George'
		})
		expect(index).toEqual(3)
	})

	it('works when the value doesn\'t exist in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		const index = controller.findIndex((value, index) => {
			return value === 'Chuck'
		})
		expect(index).toEqual(-1)
	})

	it('works when the array is undefined', () => {
		const controller = controllerWithInitialValue<string[] | undefined>(undefined)

		const index = controller.findIndex((value, index) => {
			return value === 'Chuck'
		})
		expect(index).toEqual(-1)
	})

})
