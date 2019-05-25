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

describe('changeling', () => {
	it('can work with component props', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 3,
		}

		const comp = fakeComponentProps(initial)

		const changeling = forComponentProps(comp)
		changeling.changeable('b').onChange(77)
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

		const changeling = forComponentProps(comp, 'value', 'onChange')
		changeling.changeable('b').onChange(77)
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

		const changeling = forComponentState(comp)
		changeling.changeable('b').onChange(88)
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

		const changeling = forComponentState(comp, 'b')
		const changeable = changeling.changeable()
		changeable.onChange(88)
		expect(comp.state.b).toBe(88)
		expect(changeable.value).toBe(5) // Changeable is immutable

		expect(changeling.changeable().value).toBe(88) // Changeling is mutable
	})

	it('can work with functions', () => {
		interface TestInterface {
			b: number
		}

		let value: TestInterface = {
			b: 3,
		}

		const changeling = withFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		changeling.changeable('b').onChange(77)
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

		const changeling = forComponentProps(comp)
		const changeable = changeling.changeable('a')

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

		const changeableB = changeling.changeable('b')
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
		const changeling = forComponentProps(comp)
		const changeableA = changeling.changeable('a')
		const changeableA2 = changeling.changeable('a')
		const changeableB = changeling.changeable('b')
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

		const changeling = withFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		changeling.getter('a', (value) => value + '!')

		expect(changeling.changeable('a').value).toBe('Hello!')
		changeling.changeable('a').onChange('World')
		expect(value.a).toBe('World')
		expect(changeling.changeable('a').value).toBe('World!')
	})

	it('can map values using a setter', () => {
		interface TestInterface {
			a: string
		}

		let value: TestInterface = {
			a: 'Hello',
		}

		const changeling = withFuncs(
			() => value,
			(newValue: TestInterface) => {
				value = newValue
			},
		)
		changeling.setter('a', (value) => value + '!')

		expect(changeling.changeable('a').value).toBe('Hello')
		changeling.changeable('a').onChange('World')
		expect(value.a).toBe('World!')
		expect(changeling.changeable('a').value).toBe('World!')
	})

	it('can work with nested changelings', () => {
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
		const changeling = forComponentState(comp)
		const changeling2 = changeling.changeling('nested')
		const changeable = changeling2.changeable('givenName')

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
		const changeling = forComponentState(comp)
		const changeable = changeling.changeable('name')

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
		const changeling = forComponentState(comp)
		const changeable = changeling.changeable('details')

		expect(comp.state.details).toBeUndefined()
		changeable.onChange({
			name: 'Fred',
		})
		expect(comp.state.details).not.toBeUndefined()
		expect(comp.state.details!.name).toBe('Fred')
	})

	it('can handle nested undefined and nested changelings', () => {
		interface TestInterface {
			details?: TestNestedInterface
		}

		interface TestNestedInterface {
			name?: string
		}

		const initial: TestInterface = {}
		const comp = fakeComponentState(initial)
		const changeling = forComponentState(comp)
		const changeling2 = changeling.changeling('details')
		const changeable = changeling2.changeable('name')

		expect(comp.state.details).toBeUndefined()
		changeable.onChange('Fred')
		expect(comp.state.details).not.toBeUndefined()
		expect(comp.state.details!.name).toBe('Fred')
	})

	it('can work with deeply nested changelings', () => {
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
		const changeling = forComponentState(comp)
		const changeling2 = changeling.changeling('root')
		const changeling3 = changeling2.changeling('nextLevel')
		const changeling4 = changeling3.changeling('pot')
		const changeable = changeling4.changeable()
		changeable.onChange('gold')

		expect(comp.state.root!.nextLevel!.pot).toBe('gold')
	})
})
