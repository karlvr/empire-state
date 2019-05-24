import { forComponentProps, withFuncs, forComponentState, forComponentStateProperty } from './changeling'

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

	it('can work with property of component state', () => {
		interface TestInterface {
			b: number
		}

		const initial: TestInterface = {
			b: 5,
		}

		const comp = fakeComponentState(initial)
		expect(comp.state.b).toBe(5)

		const changeling = forComponentStateProperty(comp, 'b')
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
})
