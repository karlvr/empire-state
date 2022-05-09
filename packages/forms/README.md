# Empire State - Forms

[![npm version](https://badge.fury.io/js/empire-state-forms.svg)](https://badge.fury.io/js/empire-state-forms)
[![Node CI](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml)

A small package to build [React](https://reactjs.org) forms with immutable state, limited re-rendering, type-safety and no boilerplate.

`empire-state-forms` makes use of [`empire-state-react`](https://github.com/karlvr/empire-state/tree/main/packages/react) to create immutable state updates.

You'll want to familiarise yourself with [`empire-state-react`](../react) and [`empire-state`](../core) before using this package.

## Install

```shell
npm install empire-state-forms
```

## Usage

```typescript
import { useControllerWithInitialState, useControllerValue, Text, Number } from 'empire-state-forms'

function MyForm() {
	const controller = useControllerWithInitialState({
		name: '',
		age: undefined as number | undefined,
		address: '',
	})

	const handleSave = useCallback(function(evt: React.MouseEvent) {
		evt.preventDefault()

		const value = controller.value
		// now send the value to the server or parent component
	}, [controller])

	return (
		<div>
			<div>
				<label>Name:</label>
				{/* Note that VS Code will autocomplete and type-check the prop attribute */}
				<Text type="text" controller={controller} prop="name" />
			</div>
			<div>
				<label>Age:</label>
				<Number type="number" controller={controller} prop="age" updateOnBlur={true} />
			</div>
			<div>
				<label>Address:</label>
				<Text type="text" controller={controller} prop="address" />
			</div>
			<button onClick={handleSave} />
		</div>
	)
}
```

## Components

* `<Text>` an `<input>` element for `string` properties
* `<Number>` an `<input>` element for `number` properties
* `<Checkable>` an `<input>` element for checkboxes
* `<MultiCheckable>` an `<input>` element for checkboxes for array properties
* `<TextArea>` a `<textarea>` element for `string` properties
* `<Select>` a `<select>` element
* `<Indexed>` a component for custom array properties

See the [examples](../forms-examples/src) for examples of using each of these components.

## The case for `empire-state-forms`

Here is a comparison to the code sample above with how we might normally manage form state in React components, while maintaining type-safety with TypeScript:

```typescript
function MyForm() {
	const [name, setName] = useState<string | undefined>(undefined)
	const [age, setAge] = useState<number | undefined>(undefined)
	const [address, setAddress] = useState<string | undefined>(undefined)

	const onChangeName = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		setName(evt.target.value)
	}, [])

	const onChangeAge = useCallback(function(evt: React.FocusEvent<HTMLInputElement>) {
		const newAge = parseInt(evt.target.value, 10)
		if (isNaN(newAge)) {
			evt.target.value = age !== undefined ? `${age}` : ''
			evt.target.select()
		} else {
			setAge(newAge)
		}
	}, [])

	const onChangeAddress = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		setAddress(evt.target.value)
	}, [])

	return (
		<div>
			<div>
				<label>Name:</label>
				<input type="text" value={name || ''} onChange={onChangeName} />
			</div>
			<div>
				<label>Age:</label>
				<input type="number" defaultValue={age !== undefined ? `${age}` : ''} onBlur={onChangeAge} />
			</div>
			<div>
				<label>Address:</label>
				<input type="text" value={address || ''} onChange={onChangeAddress} />
			</div>
		</div>
	)
}
```

There's a lot more code, and complex code, to deal with. And we could be using [`immer`](https://github.com/immerjs/immer) so we have immutable state, but that's even more boilerplate.

## Examples

### `useControllerWithInitialState`

Using the hook `useControllerWithInitialState` we create a new `Controller` with an initial state. Changes to the controllers value do _not_ cause the component to re-render.

In the component we use the `empire-state-forms` components to create normal `<input>` elements,
but bound to the value of one of the `Controller`'s properties, and reporting changes back 
to the component state.

The `empire-state-forms` components supports all of the regular `<input>` properties.

```typescript
import { useControllerWithInitialState, Text } from 'empire-state-forms'

interface MyFormState {
	name: string
	age?: number
	address: string
}

function MyForm() {
	const controller = useControllerWithInitialState<MyFormState>({
		name: '',
		address: '',
	})

	return (
		<div>
			<div>
				<label>Name:</label>
				<Text controller={controller} prop="name" />
			</div>
			<div>
				<label>Address:</label>
				<Text controller={controller} prop="address" />
			</div>
		</div>
	)
}
```

`useControllerWithInitialState` returns a `Controller` with an initial value. The type of the `Controller` is
determined from that initial value, or you can specify the type, e.g. `useControllerWithInitialState<Type>(...)`.

The `<Text>` component specifies the `Controller` instance via the `controller` prop, and which property
inside the controller via the `prop` prop. Due to the type-safety of the `Controller` the `prop` prop can only 
accept appropriate value, and VS Code will autocomplete valid `prop` values for you. If the controller itself contains the value you want to use, omit the `prop` prop.

### Component props

Not all components manage their own state. Many components use props to receive state and to
report changes.

In this next example the component is a part of a form, reporting changes back to its parent component via
the `onChange` function in its props. The controller uses the `value` and `onChange` properties from the props
to handle this automatically for you.

```typescript
interface MyFormSectionContents {
	givenName?: string
	familyName?: string
}

interface MyFormSectionProps {
	onChange: (newValue: MyFormSectionContents) => void
	value: MyFormSectionContents
}

function MyFormSection(props: MyFormSectionProps) {
	const controller = useStatelessController(props.value, props.onChange)

	return (
		<div>
			<div>
				<label>Full name:</label>
				<Text controller={controller} prop="givenName" placeholder="Given name" />
				<Text controller={controller} prop="familyName" placeholder="Family name" />
			</div>
		</div>
	)
}
```

### Custom components

In the examples above we've used `empire-state-forms`'s `<Text>` component replacement for the standard `<input>`
element. You can also create your own components that interact with the controller:

```typescript
import { Snapshot, wrapComponent } from 'empire-state-forms'

interface MyTextFieldProps extends Snapshot<string> {}

function MyTextField(props: MyTextFieldProps) {
	const { value, change } = props

	const onChange = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		change(evt.target.value)
	}, [change])

	return (
		<div>
			<input type="text" value={value} onChange={onChange} />
		</div>
	)
}

export default wrapComponent(MyTextField)
```

The last line above uses `empire-state-forms`'s to wrap `MyTextField`, which accepts props `value` and `change`, to create a component that instead accepts props `controller` and `prop`.

It can then be used like `<Text>` in the examples above, as in:

```typescript
import MyTextField from './MyTextField'

function MyForm() {
	const controller = useControllerWithInitialState(...)

	return (
		<div>
			<div>
				<label>Name:</label>
				<MyTextField controller={controller} prop="name" />
			</div>
			<div>
				<label>Address:</label>
				<MyTextField controller={controller} prop="address" />
			</div>
		</div>
	)
}

```

Now when the `MyTextField` component wants to change its value, it calls the `change` function in its
props, which updates the controller.

### More examples

See the [examples](../forms-examples) for more examples.
