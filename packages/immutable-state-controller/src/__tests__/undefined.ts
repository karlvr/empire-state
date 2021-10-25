import { withInitialValue } from '../creators'

describe('undefined', () => {
	it('can handle undefined parent', () => {
		interface TestInterface {
			child?: {
				name: string
			}
		}

		const controller = withInitialValue<TestInterface>({
			child: undefined,
		})

		const childController = controller.controller('child')
		expect(childController.value).toBeUndefined()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child!.name).toEqual('Patrick')
	})

	it('can handle null parent', () => {
		interface TestInterface {
			child: {
				name: string
			} | null
		}

		const controller = withInitialValue<TestInterface>({
			child: null,
		})

		const childController = controller.controller('child')
		expect(childController.value).toBeNull()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child!.name).toEqual('Patrick')
	})

	it('can handle undefined array', () => {
		interface TestInterface {
			child?: {
				name: string
			}[]
		}

		const controller = withInitialValue<TestInterface>({
			child: undefined,
		})

		const childController = controller.controller('child', 0)
		expect(childController.value).toBeUndefined()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child![0].name).toEqual('Patrick')
	})

	it('can handle null array', () => {
		interface TestInterface {
			child: {
				name: string
			}[] | null
		}

		const controller = withInitialValue<TestInterface>({
			child: null,
		})

		const childController = controller.controller('child', 0)
		expect(childController.value).toBeUndefined()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child![0].name).toEqual('Patrick')
	})

	it('can handle undefined array with non-zero index', () => {
		interface TestInterface {
			child?: {
				name: string
			}[]
		}

		const controller = withInitialValue<TestInterface>({
			child: undefined,
		})

		const childController = controller.controller('child', 1)
		expect(childController.value).toBeUndefined()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child![1].name).toEqual('Patrick')

		expect(controller.value.child![0]).toBeUndefined()
	})

	it('can handle null array with non-zero index', () => {
		interface TestInterface {
			child: {
				name: string
			}[] | null
		}

		const controller = withInitialValue<TestInterface>({
			child: null,
		})

		const childController = controller.controller('child', 1)
		expect(childController.value).toBeUndefined()
		
		const childNameController = childController.controller('name')
		expect(childNameController.value).toBeUndefined()

		childNameController.setValue('Patrick')
		expect(controller.value.child).toBeDefined()
		expect(controller.value.child![1].name).toEqual('Patrick')

		expect(controller.value.child![0]).toBeUndefined()
	})

})
