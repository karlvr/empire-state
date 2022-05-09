import { Controller } from '..'
import { controllerWithInitialValue } from '../creators'

describe('disjunctions', () => {

	interface A {
		name: string
	}

	interface B {
		value: number
	}

	function isA(value: A | B): value is A {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (value as any).name !== undefined
	}

	function isB(value: A | B): value is B {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (value as any).value !== undefined
	}

	it('can assign a specific controller to a disjunction', () => {
		const controller = controllerWithInitialValue<A>({
			name: 'A',
		})
		expect(isA(controller.value)).toBeTruthy()
		expect(isB(controller.value)).toBeFalsy()

		const controller2: Controller<A | B> = controller as unknown as Controller<A | B>
		expect(isA(controller2.value)).toBeTruthy()
		expect(isB(controller2.value)).toBeFalsy()

	})

})
