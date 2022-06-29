import { controllerWithInitialValue } from '../creators'

describe('pushNew', () => {
	it('can push a new value in a string array property', () => {
		interface TestInterface {
			children: string[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: ['Peter', 'Janet', 'Pam'],
		})

		const childrenNewController = controller.pushNew('children')
		expect(childrenNewController.value).toBeUndefined()
		childrenNewController.setValue('Barbara')
		expect(childrenNewController.value).toBeUndefined()

		expect(controller.value.children.length).toBe(4)
		expect(controller.value.children).toEqual(['Peter', 'Janet', 'Pam', 'Barbara'])
	})

	it('can push multiple new values in a string array property', () => {
		interface TestInterface {
			children: string[]
		}

		const controller = controllerWithInitialValue<TestInterface>({
			children: ['Peter', 'Janet', 'Pam'],
		})

		const childrenNewController = controller.pushNew('children')
		expect(childrenNewController.value).toBeUndefined()
		childrenNewController.setValue('Barbara')
		childrenNewController.setValue('Jack')
		expect(childrenNewController.value).toBeUndefined()

		expect(controller.value.children.length).toBe(5)
		expect(controller.value.children).toEqual(['Peter', 'Janet', 'Pam', 'Barbara', 'Jack'])
	})

})
