import { forComponentProps, withFuncs, forComponentState } from './changeling'

function fakeComponentProps<T>(initial: T) {
	const comp = {
		props: {
			onChange: (newValue: T) => {
				comp.props.value = newValue
			},
			value: initial,
		},
	}
	return comp
}

function fakeComponentState<T>(initial: T) {
	const comp = {
		state: initial,
		setState: (func: (state: T) => T) => {
			comp.state = func(comp.state)
		}
	}
	return comp
}

describe('controller', () => {
	it('can work with component props', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 3,
		}

		const comp = fakeComponentProps(initial)

		const controller = forComponentProps(comp)
		controller.snapshot('b').onChange(77)
		expect(comp.props.value.b).toBe(77)
	})

	it('can work with named component props', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 3,
		}

		const comp = fakeComponentProps(initial)

		const controller = forComponentProps(comp, 'value', 'onChange')
		controller.snapshot('b').onChange(77)
		expect(comp.props.value.b).toBe(77)
	})

	it('can work with component state', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 5,
		}

		const comp = fakeComponentState(initial)
		expect(comp.state.b).toBe(5)

		const controller = forComponentState(comp)
		controller.snapshot('b').onChange(88)
		expect(comp.state.b).toBe(88)
	})

	it('can work with a property of component state', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 5,
		}

		const comp = fakeComponentState(initial)
		expect(comp.state.b).toBe(5)

		const controller = forComponentState(comp, 'b')
		const changeable = controller.snapshot()
		changeable.onChange(88)
		expect(comp.state.b).toBe(88)
		expect(changeable.value).toBe(5) // Changeable is immutable

		expect(controller.snapshot().value).toBe(88) // Changeling is mutable
	})

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

	it('can perform immutable changes on component props', () => {
		interface TestInterface {
			a: string
			b: number
		}
		
		const initial: TestInterface = {
			a: 'Hello',
			b: 3,
		}

		const comp = fakeComponentProps(initial)

		const controller = forComponentProps(comp)
		const changeable = controller.snapshot('a')

		/* Confirm initial value */
		expect(changeable.value).toBe('Hello')

		/* Change value */
		changeable.onChange('World')

		/* The value in the changeable isn't changed, as changeable just reports changes */
		expect(changeable.value).toBe('Hello')

		/* The value in our initial isn't changed, as changeable uses immer */
		expect(initial.a).toBe('Hello')

		/* The value in our component is changed, as our root onChange function changes it */
		expect(comp.props.value.a).toBe('World')

		const changeableB = controller.snapshot('b')
		changeableB.onChange(5)
		expect(initial.b).toBe(3)
		expect(comp.props.value.b).toBe(5)
		expect(comp.props.value.a).toBe('World')
	})

	it('can return changeable without making lots of onChange functions', () => {
		interface TestInterface {
			a: string
			b: number
		}
		
		const initial: TestInterface = {
			a: 'Donkey',
			b: 7,
		}

		const comp = fakeComponentProps(initial)
		const controller = forComponentProps(comp)
		const changeableA = controller.snapshot('a')
		const changeableA2 = controller.snapshot('a')
		const changeableB = controller.snapshot('b')
		expect(changeableA.onChange).toBe(changeableA2.onChange)
		expect(changeableA.onChange).not.toBe(changeableB.onChange)
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

	it('can work with nested controllers', () => {
		interface TestInterface {
			nested: NestedTestInterface
		}

		interface NestedTestInterface {
			givenName: string
		}

		const initial: TestInterface = {
			nested: {
				givenName: 'Jorge',
			}
		}

		const comp = fakeComponentState(initial)
		const controller = forComponentState(comp)
		const controller2 = controller.controller('nested')
		const changeable = controller2.snapshot('givenName')

		expect(changeable.value).toBe('Jorge')
		changeable.onChange('Daniel')
		expect(changeable.value).toBe('Jorge') // It is immutable
		expect(initial.nested.givenName).toBe('Jorge') // It is immutable
		expect(comp.state.nested.givenName).toBe('Daniel')
	})

	it('can handle undefined', () => {
		interface TestInterface {
			name?: string
		}

		const initial: TestInterface = {}
		const comp = fakeComponentState(initial)
		const controller = forComponentState(comp)
		const changeable = controller.snapshot('name')

		expect(comp.state.name).toBeUndefined()
		changeable.onChange('Fred')
		expect(comp.state.name).toBe('Fred')
	})

	it('can handle nested undefined', () => {
		interface TestInterface {
			details?: TestNestedInterface
		}

		interface TestNestedInterface {
			name?: string
		}

		const initial: TestInterface = {}
		const comp = fakeComponentState(initial)
		const controller = forComponentState(comp)
		const changeable = controller.snapshot('details')

		expect(comp.state.details).toBeUndefined()
		changeable.onChange({
			name: 'Fred',
		})
		expect(comp.state.details).not.toBeUndefined()
		expect(comp.state.details!.name).toBe('Fred')
	})

	it('can handle nested undefined and nested controllers', () => {
		interface TestInterface {
			details?: TestNestedInterface
		}

		interface TestNestedInterface {
			name?: string
		}

		const initial: TestInterface = {}
		const comp = fakeComponentState(initial)
		const controller = forComponentState(comp)
		const controller2 = controller.controller('details')
		const changeable = controller2.snapshot('name')

		expect(comp.state.details).toBeUndefined()
		changeable.onChange('Fred')
		expect(comp.state.details).not.toBeUndefined()
		expect(comp.state.details!.name).toBe('Fred')
	})

	it('can work with deeply nested controllers', () => {
		interface TestInterface {
			root?: TestInterface2
		}

		interface TestInterface2 {
			nextLevel?: TestInterface3
		}

		interface TestInterface3 {
			pot: string
		}

		const initial: TestInterface = {}
		
		const comp = fakeComponentState(initial)
		const controller = forComponentState(comp)
		const controller2 = controller.controller('root')
		const controller3 = controller2.controller('nextLevel')
		const controller4 = controller3.controller('pot')
		const changeable = controller4.snapshot()
		changeable.onChange('gold')

		expect(comp.state.root!.nextLevel!.pot).toBe('gold')
	})
})
