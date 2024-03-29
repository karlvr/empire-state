import { controllerWithInitialValue } from '../creators'

describe('map', () => {
	it('can map an array property', () => {
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

		const names = controller.map('children', (controller, index) => {
			return controller.value.name
		})

		expect(names.length).toEqual(7)
		expect(names[3]).toEqual('Barbara')
	})

	it('can map an array controller', () => {
		const controller = controllerWithInitialValue(['Julian', 'Dick', 'Anne', 'George', 'Timmy'])

		const names = controller.map((controller, index) => {
			return controller.value
		})
		expect(names.length).toEqual(5)
		expect(names[4]).toEqual('Timmy')
	})

	it('can detect non-array values', () => {
		const controller = controllerWithInitialValue({ name: 'Julina' })
		expect(() => controller.map((childController, index) => {
			return childController.value
		})).toThrowError(/^Controller.map called with non-array value/)
	})

})
