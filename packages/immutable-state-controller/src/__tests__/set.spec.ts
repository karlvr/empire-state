import { withInitialValue } from '../creators'

describe('set', () => {
	it('can set array value', () => {
		const controller = withInitialValue([1, 2, 3])
		expect(controller.value[2]).toEqual(3)
		controller.set(2, 9)
		expect(controller.value[2]).toEqual(9)
	})

	it('can set object value', () => {
		const controller = withInitialValue({
			a: 'cat',
			b: 'dog',
			c: 'mouse',
		})
		expect(controller.value.b).toEqual('dog')
		controller.set('b', 'chicken')
		expect(controller.value.b).toEqual('chicken')
	})

	it('can set whole array value', () => {
		const controller = withInitialValue([1, 2, 3])
		expect(controller.value[2]).toEqual(3)
		controller.set('this', [9])
		expect(controller.value.length).toEqual(1)
		expect(controller.value[0]).toEqual(9)
	})

	it('can set whole object value', () => {
		const controller = withInitialValue({
			a: 'cat',
			b: 'dog',
			c: 'mouse',
		})
		expect(controller.value.b).toEqual('dog')
		controller.set('this', {
			a: 'fish',
			b: 'octopus',
			c: 'squid',
		})
		expect(controller.value.b).toEqual('octopus')
	})
})
