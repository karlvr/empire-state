import { controllerWithInitialValue } from '../creators'
import { transformStringToNumber } from '../transformers'

describe('changeFunc', () => {
	it('can change itself', () => {
		const controller = controllerWithInitialValue('apple')
 
		expect(controller.value).toEqual('apple')
		controller.onChange()(current => `${current} pie`)
		expect(controller.value).toEqual('apple pie')
	})

	it('can change an array property', () => {
		const controller = controllerWithInitialValue(['apple', 'bear', 'cat'])

		expect(controller.value[1]).toEqual('bear')
		controller.onChange(1)(current => `${current} cub`)
		expect(controller.value[1]).toEqual('bear cub')
	})

	it('can change an object property', () => {
		const controller = controllerWithInitialValue({
			a: 'apple',
			b: false,
		})

		expect(controller.value.a).toEqual('apple')
		controller.onChange('a')(current => `${current} pie`)
		expect(controller.value.a).toEqual('apple pie')
	})

	it('can change an object array property', () => {
		const controller = controllerWithInitialValue({
			a: ['apple', 'bear', 'cat'],
		})

		expect(controller.value.a[0]).toEqual('apple')
		controller.onChange('a', 0)(current => `${current} pie`)
		expect(controller.value.a[0]).toEqual('apple pie')
	})

	it('can transform a scalar string to a number', () => {
		const controller = controllerWithInitialValue('17')

		const numericController = transformStringToNumber(controller)
		expect(numericController.value).toBe(17)

		numericController.onChange()(current => current + 1)
		expect(numericController.value).toEqual(18)
		expect(controller.value).toEqual('18')
	})

})
