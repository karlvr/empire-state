import { withFuncs, withMutable } from './creators'

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
		controller.snapshot('b').setValue(77)
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
		controller.snapshot('a').setValue('World')
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
		controller.snapshot('a').setValue('World')
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
		controller.snapshot('name').setValue('Modified')
		
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
		snap.setValue('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.controller('names').snapshot(1)
		expect(snap2.value).toBe('Avon')
		snap2.setValue('Jenna')
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
		snap.setValue('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.snapshot('names', 1)
		expect(snap2.value).toBe('Avon')
		snap2.setValue('Jenna')
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
		snap.setValue('Vila')
		expect(value.names[0]).toBe('Vila')

		const c2 = controller.controller('names', 1)
		const snap2 = c2.snapshot()
		expect(snap2.value).toBe('Avon')
		snap2.setValue('Jenna')
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

		a.setValue('Bye')
		expect(a.value).toBe('Hello world')
		expect(state.a).toBe('Bye')

		const aa = controller.snapshot('a')
		expect(aa.value).toBe('Bye')

		const c = controller.snapshot('c')
		c.setValue({
			d: 'Changed',
			e: ['E'],
		})

		expect(state.c.d).toBe('Changed')

		const e = controller.controller('c').snapshot('e')
		expect(e.value).toEqual(['E'])

		e.setValue(['F', 'G'])
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
			expect(error.name).toBe('TypeError')
		}
	})

})
