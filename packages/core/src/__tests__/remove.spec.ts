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

	it('can remove a value from a parent array', () => {
		interface TestInterface {
			children: string[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: [
				'Peter',
				'Janet',
				'Pam',
			],
		})

		expect(controller.value.children.length).toEqual(3)

		const firstChildController = controller.get('children', 0)
		expect(firstChildController.value).toEqual('Peter')
		firstChildController.remove()

		expect(controller.value.children.length).toEqual(2)

		/* The child controller now points at the new first element */
		expect(firstChildController.value).toEqual('Janet')
	})

	it('can remove a value from a parent object', () => {
		interface TestInterface {
			a: string | undefined
			b: string | undefined
		}

		const controller = controllerWithInitialValue<TestInterface>({
			a: 'Hello',
			b: 'World',
		})

		expect(controller.value).toEqual({ a: 'Hello', b: 'World' })

		const aController = controller.get('a')
		expect(aController.value).toEqual('Hello')
		aController.remove()
		
		expect(controller.value).toEqual({ b: 'World' })
		
		/* The child controller still points at the property, which is undefined */
		expect(aController.value).toBeUndefined()
	})
})
