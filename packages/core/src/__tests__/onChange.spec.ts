import { controllerWithInitialValue } from '../creators'

describe('onChange', () => {
	it('can change itself', () => {
		const controller = controllerWithInitialValue('apple')
 
		expect(controller.value).toEqual('apple')
		controller.onChange()('bear')
		expect(controller.value).toEqual('bear')
	})

	it('can change an array property', () => {
		const controller = controllerWithInitialValue(['apple', 'bear', 'cat'])

		expect(controller.value[1]).toEqual('bear')
		controller.onChange(1)('bone')
		expect(controller.value[1]).toEqual('bone')
	})

	it('can change an object property', () => {
		const controller = controllerWithInitialValue({
			a: 'apple',
			b: false,
		})

		expect(controller.value.a).toEqual('apple')
		controller.onChange('a')('bear')
		expect(controller.value.a).toEqual('bear')
	})

	it('can change an object array property', () => {
		const controller = controllerWithInitialValue({
			a: ['apple', 'bear', 'cat'],
		})

		expect(controller.value.a[0]).toEqual('apple')
		controller.onChange('a', 0)('ant')
		expect(controller.value.a[0]).toEqual('ant')
	})

})
