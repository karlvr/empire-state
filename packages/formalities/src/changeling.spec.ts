import { withFuncs, withMutable } from 'formalities'

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
		controller.snapshot('b').onChange(77)
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
		controller.snapshot('a').onChange('World')
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
		controller.snapshot('a').onChange('World')
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
		controller.snapshot('name').onChange('Modified')
		
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
		snap.onChange('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.controller('names').snapshot(1)
		expect(snap2.value).toBe('Avon')
		snap2.onChange('Jenna')
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
		snap.onChange('Vila')
		expect(value.names[0]).toBe('Vila')

		const snap2 = controller.snapshot('names', 1)
		expect(snap2.value).toBe('Avon')
		snap2.onChange('Jenna')
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
		snap.onChange('Vila')
		expect(value.names[0]).toBe('Vila')

		const c2 = controller.controller('names', 1)
		const snap2 = c2.snapshot()
		expect(snap2.value).toBe('Avon')
		snap2.onChange('Jenna')
		expect(value.names[1]).toBe('Jenna')
	})

})
