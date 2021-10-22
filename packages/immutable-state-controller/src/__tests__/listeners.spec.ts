import { withInitialValue } from '../creators'

describe('change listeners', () => {
	it('can report changes', () => {
		const state = {
			a: 'Hello world',
		}

		let noticedChange = ''

		const controller = withInitialValue(state)
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

		const controller = withInitialValue(state)
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

		const controller = withInitialValue(state)
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

		const controller = withInitialValue(state)
		controller.addChangeListener((newValue) => {
			controller.setValue({
				a: newValue.a + '!',
			})
		})

		controller.snapshot('a').change('Bye')
		expect(controller.value.a).toEqual('Bye!')
	})

})
