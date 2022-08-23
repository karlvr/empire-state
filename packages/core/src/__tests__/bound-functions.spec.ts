import { controllerWithInitialValue } from '../creators'

describe('bound-functions', () => {
	it('controller functions are bound', () => {
		const controller = controllerWithInitialValue('Hello')
		const setValue = controller.setValue

		expect(controller.value).toEqual('Hello')
		setValue('World')
		expect(controller.value).toEqual('World')
	})

})
