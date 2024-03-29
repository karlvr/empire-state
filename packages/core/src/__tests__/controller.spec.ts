import { controllerWithFuncs, controllerWithInitialValue } from '../creators'

describe('controller', () => {
	it('can work with functions', () => {
		interface TestInterface {
			b: number
		}

		let value: TestInterface = {
			b: 3,
		}

		const controller = controllerWithFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		expect(value.b).toBe(3)
		const snapshot = controller.snapshot('b')
		expect(controller.value.b).toBe(3)
		expect(snapshot.value).toBe(3)
		snapshot.change(77)
		expect(value.b).toBe(77) /* Original value HAS changed */
		expect(controller.value.b).toBe(77) /* Controller value HAS changed */
		expect(snapshot.value).toBe(3) /* Snapshot value HASN'T changed */
	})

	it('can map values using a getter', () => {
		interface TestInterface {
			a: string
		}
		
		let value: TestInterface = {
			a: 'Hello',
		}

		const controller = controllerWithFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		controller.getter('a', (value) => value + '!')

		expect(controller.snapshot('a').value).toBe('Hello!')
		controller.snapshot('a').change('World')
		expect(value.a).toBe('World')
		expect(controller.snapshot('a').value).toBe('World!')
	})

	it('can map values using a setter', () => {
		interface TestInterface {
			a: string
		}

		let value: TestInterface = {
			a: 'Hello',
		}

		const controller = controllerWithFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		controller.setter('a', (value) => value + '!')

		expect(controller.snapshot('a').value).toBe('Hello')
		controller.snapshot('a').change('World')
		expect(value.a).toBe('World!')
		expect(controller.snapshot('a').value).toBe('World!')
	})

	it('can work with mutable root', () => {
		interface TestInterface {
			name: string
		}

		const controller = controllerWithInitialValue<TestInterface>({
			name: 'Original',
		})
		controller.snapshot('name').change('Modified')
		
		expect(controller.value.name).toBe('Modified')
	})

	it('can work with indexed property snapshots', () => {
		interface TestInterface {
			names: string[]
		}
		const controller = controllerWithInitialValue<TestInterface>({
			names: ['Blake', 'Avon'],
		})
		expect(controller.snapshot('names').value).toEqual(['Blake', 'Avon'])

		const snap = controller.get('names').snapshot(0)
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(controller.value.names[0]).toBe('Vila')

		const snap2 = controller.get('names').snapshot(1)
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(controller.value.names[1]).toBe('Jenna')
	})

	it('can work with direct indexed properties snapshots', () => {
		interface TestInterface {
			names: string[]
		}
		const controller = controllerWithInitialValue<TestInterface>({
			names: ['Blake', 'Avon'],
		})

		const snap = controller.snapshot('names', 0)
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(controller.value.names[0]).toBe('Vila')

		const snap2 = controller.snapshot('names', 1)
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(controller.value.names[1]).toBe('Jenna')
	})

	it('can work with direct indexed property controllers', () => {
		interface TestInterface {
			names: string[]
		}
		const controller = controllerWithInitialValue<TestInterface>({
			names: ['Blake', 'Avon'],
		})

		const c = controller.get('names', 0)
		const snap = c.snapshot()
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(controller.value.names[0]).toBe('Vila')

		const c2 = controller.get('names', 1)
		const snap2 = c2.snapshot()
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(controller.value.names[1]).toBe('Jenna')
	})

	it('example works', () => {
		const controller = controllerWithInitialValue({
			a: 'Hello world',
			b: 42,
			c: {
				d: 'Nested okay',
				e: ['A', 'B', 'C', 'D'],
			},
		})

		const a = controller.snapshot('a')
		expect(a.value).toBe('Hello world')

		a.change('Bye')
		expect(a.value).toBe('Hello world')
		expect(controller.value.a).toBe('Bye')

		const aa = controller.snapshot('a')
		expect(aa.value).toBe('Bye')

		const c = controller.snapshot('c')
		c.change({
			d: 'Changed',
			e: ['E'],
		})

		expect(controller.value.c.d).toBe('Changed')

		const e = controller.get('c').snapshot('e')
		expect(e.value).toEqual(['E'])

		e.change(['F', 'G'])
		expect(controller.value.c.e).toEqual(['F', 'G'])
	})

	it('cant modify snapshot', () => {
		const state = {
			a: 'Hello world',
		}
		
		const controller = controllerWithInitialValue(state)
		try {
			controller.snapshot().value.a = 'test'
			fail('Should have failed to modify')
		} catch (error) {
			expect((error as Error).name).toBe('TypeError')
		}
	})

	it('can work with primitive property snapshot', () => {
		const controller = controllerWithInitialValue({
			a: 'Hello world',
		})
		controller.snapshot('a').change('Bye')
		expect(controller.value.a).toEqual('Bye')
	})

	it('returns the same controller each time for properties', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = controllerWithInitialValue(state)
		const aController = controller.get('a')
		const anotherController = controller.get('a')
		expect(aController).toBe(anotherController)
	})

	it('returns the same snapshot each time for properties', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = controllerWithInitialValue(state)
		const aSnapshot = controller.snapshot('a')
		const anotherSnapshot = controller.snapshot('a')
		expect(aSnapshot).toBe(anotherSnapshot)
	})

	it('supports snapshot this', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = controllerWithInitialValue(state)

		const snapshot = controller.snapshot('this')
		expect(snapshot.value).toBe(state)
	})

	it('supports controller this', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = controllerWithInitialValue(state)
		expect(controller.get('this')).toBe(controller)
	})

})
