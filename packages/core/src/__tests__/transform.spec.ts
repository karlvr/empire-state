import { controllerWithInitialValue } from '../creators'
import { transformNullToUndefined, transformStringToNumber } from '../transformers'

describe('transform', () => {
	it('can transform a scalar string to a number', () => {
		const controller = controllerWithInitialValue('17')

		const numericController = transformStringToNumber(controller)
		expect(numericController.value).toBe(17)
	})
	
	it('can transform a null scalar string to a number', () => {
		const controller = controllerWithInitialValue<string | null>(null)

		const numericController = transformStringToNumber(controller)
		expect(numericController.value).toBeNull()

		numericController.setValue(7)
		expect(controller.value).toEqual('7')
	})

	it('can transform a scalar string or boolean to a number', () => {
		const controller = controllerWithInitialValue<string | boolean>('17')

		const numericController = transformStringToNumber(controller)
		const value = numericController.value
		if (value === true) {
			/* Just a test that `value` has `boolean` in a type union */
		}

		expect(numericController.value).toBe(17)
		numericController.setValue(true)
		expect(numericController.value).toEqual(true)
		expect(controller.value).toEqual(true)
		numericController.setValue(13)
		expect(typeof controller.value).toEqual('string')
		expect(controller.value).toEqual('13')
	})

	it('can transform null to undefined', () => {
		const controller = controllerWithInitialValue<string | null>('Hello')
		const x = transformNullToUndefined(controller)
		expect(x.value).toEqual('Hello')

		x.setValue(undefined)
		expect(controller.value).toBeNull()
		x.setValue('World')
		expect(controller.value).toEqual('World')
	})

})
