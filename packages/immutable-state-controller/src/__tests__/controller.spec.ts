import { withFuncs, withMutable, withValue } from '../creators'

describe('controller', () => {
	it('can work with functions', () => {
		interface TestInterface {
			b: number
		}

		let value: TestInterface = {
			b: 3,
		}

		const controller = withFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		controller.snapshot('b').change(77)
		expect(value.b).toBe(77)
	})

	it('can map values using a getter', () => {
		interface TestInterface {
			a: string
		}
		
		let value: TestInterface = {
			a: 'Hello',
		}

		const controller = withFuncs(
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

		const controller = withFuncs(
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
		const value: TestInterface = {
			name: 'Original',
		}

		const controller = withMutable(value)
		controller.snapshot('name').change('Modified')
		
		expect(value.name).toBe('Modified')
	})

	it('can work with indexed property snapshots', () => {
		interface TestInterface {
			names: string[]
		}
		const value: TestInterface = {
			names: ['Blake', 'Avon'],
		}
		const controller = withMutable(value)
		expect(controller.snapshot('names').value).toEqual(['Blake', 'Avon'])

		const snap = controller.controller('names').snapshot(0)
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.controller('names').snapshot(1)
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(value.names[1]).toBe('Jenna')
	})

	it('can work with direct indexed properties snapshots', () => {
		interface TestInterface {
			names: string[]
		}
		const value: TestInterface = {
			names: ['Blake', 'Avon'],
		}
		const controller = withMutable(value)

		const snap = controller.snapshot('names', 0)
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.snapshot('names', 1)
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(value.names[1]).toBe('Jenna')
	})

	it('can work with direct indexed property controllers', () => {
		interface TestInterface {
			names: string[]
		}
		const value: TestInterface = {
			names: ['Blake', 'Avon'],
		}
		const controller = withMutable(value)

		const c = controller.controller('names', 0)
		const snap = c.snapshot()
		expect(snap.value).toBe('Blake')
		snap.change('Vila')
		expect(value.names[0]).toBe('Vila')

		const c2 = controller.controller('names', 1)
		const snap2 = c2.snapshot()
		expect(snap2.value).toBe('Avon')
		snap2.change('Jenna')
		expect(value.names[1]).toBe('Jenna')
	})

	it('example works', () => {
		const state = {
			a: 'Hello world',
			b: 42,
			c: {
				d: 'Nested okay',
				e: ['A', 'B', 'C', 'D'],
			},
		}
		
		const controller = withMutable(state)

		const a = controller.snapshot('a')
		expect(a.value).toBe('Hello world')

		a.change('Bye')
		expect(a.value).toBe('Hello world')
		expect(state.a).toBe('Bye')

		const aa = controller.snapshot('a')
		expect(aa.value).toBe('Bye')

		const c = controller.snapshot('c')
		c.change({
			d: 'Changed',
			e: ['E'],
		})

		expect(state.c.d).toBe('Changed')

		const e = controller.controller('c').snapshot('e')
		expect(e.value).toEqual(['E'])

		e.change(['F', 'G'])
		expect(state.c.e).toEqual(['F', 'G'])
	})

	it('cant modify snapshot', () => {
		const state = {
			a: 'Hello world',
		}
		
		const controller = withMutable(state)
		try {
			controller.snapshot().value.a = 'test'
			fail('Should have failed to modify')
		} catch (error) {
			expect((error as Error).name).toBe('TypeError')
		}
	})

	it('can work with primitive property snapshot', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = withMutable(state)
		controller.snapshot('a').change('Bye')
		expect(state.a).toEqual('Bye')
	})

	it('can report changes', () => {
		const state = {
			a: 'Hello world',
		}

		let noticedChange: string = ''

		const controller = withMutable(state)
		controller.addChangeListener((newValue, oldValue) => {
			noticedChange = newValue.a
		})

		controller.snapshot('a').change('Bye')
		expect(noticedChange).toEqual('Bye')
	})

	it('can report changes and we see whole snapshot', () => {
		const state = {
			a: 'Hello world',
			b: 'Another',
		}

		let noticedChange: string = ''
		let noticedAnotherChange: string = ''

		const controller = withMutable(state)
		controller.addChangeListener((newValue, oldValue) => {
			noticedChange = newValue.a
			noticedAnotherChange = newValue.b
		})

		controller.snapshot('a').change('Bye')
		expect(noticedChange).toEqual('Bye')
		expect(noticedAnotherChange).toEqual('Another')
	})

	it('can report changes with old value', () => {
		const state = {
			a: 'Hello world',
		}

		let noticedChange: string = ''
		let noticedOld: string = ''

		/* Note that it's withValue not withMutable, as oldValue doesn't report accurately if the source is mutable */
		const controller = withValue(state)
		controller.addChangeListener((newValue, oldValue) => {
			noticedChange = newValue.a
			noticedOld = oldValue.a
		})

		controller.snapshot('a').change('Bye')
		expect(noticedChange).toEqual('Bye')
		expect(noticedOld).toEqual('Hello world')
		expect(state.a).toEqual('Hello world')
		expect(controller.snapshot().value.a).toEqual('Bye')
	})

	it('returns the same controller each time for properties', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = withValue(state)
		const aController = controller.controller('a')
		const anotherController = controller.controller('a')
		expect(aController).toBe(anotherController)
	})

	it('returns the same snapshot each time for properties', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = withValue(state)
		const aSnapshot = controller.snapshot('a')
		const anotherSnapshot = controller.snapshot('a')
		expect(aSnapshot).toBe(anotherSnapshot)
	})

	it('supports snapshot this', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = withValue(state)

		const snapshot = controller.snapshot('this')
		expect(snapshot.value).toBe(state)
	})

	it('supports controller this', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = withValue(state)
		expect(controller.controller('this')).toBe(controller)
	})

})
