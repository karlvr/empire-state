import { controllerWithInitialValue } from '../creators'

describe('onToggle', () => {
	it('can toggle itself', () => {
		const controller = controllerWithInitialValue(true)

		controller.onToggle()()

		expect(controller.value).toBe(false)

		controller.onToggle()()

		expect(controller.value).toBe(true)
	})
	it('can toggle itself with optional value', () => {
		const controller = controllerWithInitialValue<boolean | undefined>(true)

		controller.onToggle()()

		expect(controller.value).toBe(false)

		controller.onToggle()()

		expect(controller.value).toBe(true)
	})

	it('can toggle an array property', () => {
		const controller = controllerWithInitialValue([true, false, true])

		expect(controller.value[1]).toBe(false)
		controller.onToggle(1)()
		expect(controller.value[1]).toBe(true)
	})

	it('can toggle an optional array property', () => {
		const controller = controllerWithInitialValue<boolean[] | undefined>([true, false, true])

		expect(controller.value![1]).toBe(false)
		controller.onToggle(1)()
		expect(controller.value![1]).toBe(true)
	})

	it('can toggle an array property containing optional', () => {
		const controller = controllerWithInitialValue<(boolean | undefined)[]>([true, false, true])

		expect(controller.value![1]).toBe(false)
		controller.onToggle(1)()
		expect(controller.value![1]).toBe(true)
	})

	it('can toggle an object property', () => {
		const controller = controllerWithInitialValue({
			a: true,
			b: false,
		})

		expect(controller.value.a).toBe(true)
		controller.onToggle('a')()
		expect(controller.value.a).toBe(false)
	})

	it('can toggle an optional object property', () => {
		interface ObjectWithOptionalProperty {
			a?: boolean
		}

		const controller = controllerWithInitialValue<ObjectWithOptionalProperty>({
			a: true,
		})

		expect(controller.value.a).toBe(true)
		controller.onToggle('a')()
		expect(controller.value.a).toBe(false)
	})

	it('can toggle an object array property', () => {
		const controller = controllerWithInitialValue({
			a: [true, false],
		})

		expect(controller.value.a[0]).toBe(true)
		controller.onToggle('a', 0)()
		expect(controller.value.a[0]).toBe(false)
	})

	it('can toggle an object array property containing optionals', () => {
		interface ObjectWithArrayPropertyContainingOptionals {
			a: (boolean | undefined)[]
		}

		const controller = controllerWithInitialValue<ObjectWithArrayPropertyContainingOptionals>({
			a: [true, false],
		})

		expect(controller.value.a[0]).toBe(true)
		controller.onToggle('a', 0)()
		expect(controller.value.a[0]).toBe(false)
	})

	it('can toggle an optional object array property', () => {
		interface ObjectWithOptionalArrayProperty {
			a?: boolean[]
		}

		const controller = controllerWithInitialValue<ObjectWithOptionalArrayProperty>({
			a: [true, false],
		})

		expect(controller.value.a![0]).toBe(true)
		controller.onToggle('a', 0)()
		expect(controller.value.a![0]).toBe(false)
	})

	it('can toggle an optional object array property that is undefined', () => {
		interface ObjectWithOptionalArrayProperty {
			a?: boolean[]
		}

		const controller = controllerWithInitialValue<ObjectWithOptionalArrayProperty>({})

		expect(controller.value.a).toBeUndefined()
		controller.onToggle('a', 0)()
		expect(controller.value.a![0]).toBe(true)
	})

})
