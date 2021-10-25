import { withInitialValue } from '../creators'

describe('map', () => {
	it('can map', () => {
		interface TestInterface {
			children: {
				name: string
			}[]
		}

		const controller = withInitialValue<TestInterface>({
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

})
