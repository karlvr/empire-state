import { forComponentProps, withFuncs } from './changeling'

interface TestInterface {
	a: string
	b: number
	c: boolean
}

function fakeComponent<T>(initial: T) {
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

describe('changeling', () => {
	it('can work with components', () => {
		const initial: TestInterface = {
			a: 'Hello',
			b: 3,
			c: true,
		}

		const comp = fakeComponent(initial)

		const changeling = forComponentProps(comp)
		changeling.changeable('b').onChange(77)
		expect(comp.props.value.b).toBe(77)
	})

	it('can work with functions', () => {
		let value: TestInterface = {
			a: 'Hello',
			b: 3,
			c: true,
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

	it('can perform immutable changes', () => {
		const initial: TestInterface = {
			a: 'Hello',
			b: 3,
			c: true,
		}

		const comp = fakeComponent(initial)

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
		const initial: TestInterface = {
			a: 'Donkey',
			b: 7,
			c: false,
		}

		const comp = fakeComponent(initial)
		const changeling = forComponentProps(comp)
		const changeableA = changeling.changeable('a')
		const changeableA2 = changeling.changeable('a')
		const changeableB = changeling.changeable('b')
		expect(changeableA.onChange).toBe(changeableA2.onChange)
		expect(changeableA.onChange).not.toBe(changeableB.onChange)
	})
})
