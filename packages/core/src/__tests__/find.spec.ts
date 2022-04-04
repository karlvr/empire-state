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

		const colin = controller.find('children', (value, index) => {
			return value.name === 'Colin'
		})

		expect(colin).toBeDefined()
		expect(colin!.value.name).toEqual('Colin')
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

		const result = controller.find('children', (value, index) => {
			return value.name === 'Anne'
		})

		expect(result).toBeUndefined()
	})

	it('can find a value in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		const name = controller.find((value, index) => {
			return value === 'George'
		})
		expect(name?.value).toEqual('George')
	})

	it('works when the value doesn\'t exist in an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		const name = controller.find((value, index) => {
			return value === 'Chuck'
		})
		expect(name).toBeUndefined()
	})

	it('works when the array is undefined', () => {
		const controller = controllerWithInitialValue<string[] | undefined>(undefined)

		const name = controller.find((value, index) => {
			return value === 'Chuck'
		})
		expect(name).toBeUndefined()
	})

})
