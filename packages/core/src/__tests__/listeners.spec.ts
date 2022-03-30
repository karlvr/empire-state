import { controllerWithInitialValue } from '../creators'

describe('change listeners', () => {
	it('can report changes', () => {
		const state = {
			a: 'Hello world',
		}

		let noticedChange = ''

		const controller = controllerWithInitialValue(state)
		controller.addChangeListener((newValue) => {
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

		let noticedChange = ''
		let noticedAnotherChange = ''

		const controller = controllerWithInitialValue(state)
		controller.addChangeListener((newValue) => {
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

		let noticedChange = ''
		let noticedOld = ''

		const controller = controllerWithInitialValue(state)
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

	it('can make changes in a listener without infinite recursion', () => {
		const state = {
			a: 'Hello world',
		}

		const controller = controllerWithInitialValue(state)
		controller.addChangeListener((newValue) => {
			controller.setValue({
				a: newValue.a + '!',
			})
		})

		controller.snapshot('a').change('Bye')
		expect(controller.value.a).toEqual('Bye!')
	})

	it('can notify parent controller listeners when the value changes from the child', () => {
		const state = {
			child: {
				value: 'Hello',
			},
		}

		let noticedChange = ''

		const parent = controllerWithInitialValue(state)
		parent.addChangeListener((newValue) => {
			noticedChange = newValue.child.value
		})

		const child = parent.get('child')
		child.snapshot('value').change('World')

		expect(noticedChange).toEqual('World')
	})

	it('can notify child controller listeners when their value changes in the parent', () => {
		const state = {
			child: {
				value: 'Hello',
			},
		}

		let noticedChange = ''

		const parent = controllerWithInitialValue(state)

		const child = parent.get('child')
		child.addChangeListener((newValue) => {
			noticedChange = newValue.value
		})

		parent.snapshot().change({
			child: { value: 'World' },
		})

		expect(noticedChange).toEqual('World')
	})

	it('doesn\'t fire child controller listeners multiple times when the value changes from the child', () => {
		const state = {
			child: {
				value: 'Hello',
			},
		}

		let noticedChange = ''
		let parentFired = 0
		let childFired = 0

		const parent = controllerWithInitialValue(state)
		parent.addChangeListener((newValue) => {
			noticedChange = newValue.child.value
			parentFired += 1
		})

		const child = parent.get('child')
		child.addChangeListener((newValue) => {
			childFired += 1
		})
		child.snapshot('value').change('World')

		expect(noticedChange).toEqual('World')
		expect(parentFired).toEqual(1)
		expect(childFired).toEqual(1)
	})

	it('only notifies once when using an indexed controller', () => {
		const state = {
			a: [{
				b: 'Hello world',
			}],
		}

		let eventCount = 0

		const changeListener = () => {
			eventCount += 1
		}

		const controller = controllerWithInitialValue(state)

		const controller2 = controller.get('a', 0)
		const controller3 = controller2.get('b')
		controller3.addChangeListener(changeListener)
		controller3.setValue('Goodbye world')

		expect(eventCount).toEqual(1)
	})

	it('is chainable', () => {
		const state = {
			a: 'Hello world',
		}

		const changeListener = () => null

		const controller = controllerWithInitialValue(state)

		expect(controller.addChangeListener(changeListener)).toBe(controller)
		expect(controller.removeChangeListener(changeListener)).toBe(controller)
		expect(controller.removeAllChangeListeners()).toBe(controller)
	})
})
