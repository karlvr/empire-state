# Formalities

A small library to build React forms with immutable state, type-safety and not a lot of boilerplate.

Formalities makes use of [Immer](https://github.com/immerjs/immer) and [Immutable State Controller](https://github.com/karlvr/immutable-state-controller) to create immutable state updates.

## Install

```shell
npm install formalities
```

## Usage

```typescript
import { useController, Formalities } from 'formalities'

function MyForm() {
	const controller = useController({
		name: '',
		age: undefined as number | undefined,
		address: '',
	})

	function save() {
		const values = controller.snapshot().value
		...
	}

	return (
		<div>
			<div>
				<label>Name:</label>
				<Formalities.Text type="text" controller={controller} prop="name" />
			</div>
			<div>
				<label>Age:</label>
				<Formalities.Number type="number" controller={controller} prop="age" updateOnBlur={true} />
			</div>
			<div>
				<label>Address:</label>
				<Formalities.Text type="text" controller={controller} prop="address" />
			</div>
			<button onClick={save} />
		</div>
	)
}
```

## Components

* `<Formalities.Text>` an `<input>` element for `string` properties
* `<Formalities.Number>` an `<input>` element for `number` properties
* `<Formalities.Checkable>` an `<input>` element for checkboxes
* `<Formalities.MultiCheckable>` an `<input>` element for checkboxes for array properties
* `<Formalities.TextArea>` a `<textarea>` element for `string` properties
* `<Formalities.Select>` a `<select>` element
* `<Formalities.Indexed>` a component for custom array properties

See the [examples](https://github.com/karlvr/formalities/tree/master/packages/examples/src) for examples of using each of these components.

## The case for Formalities

This is how we might manage form state in React components, while maintaining type-safety with
TypeScript:

```typescript
function MyForm() {
	const [name, setName] = useState<string | undefined>(undefined)
	const [age, setAge] = useState<number | undefined>(undefined)
	const [address, setAddress] = useState<string | undefined>(undefined)

	function onChangeName(evt: React.ChangeEvent<HTMLInputElement>) {
		setName(evt.target.value)
	}

	function onChangeAge(evt: React.FocusEvent<HTMLInputElement>) {
		const newAge = parseInt(evt.target.value, 10)
		if (isNaN(newAge)) {
			evt.target.value = age !== undefined ? `${age}` : ''
			evt.target.select()
		} else {
			setAge(newAge)
		}
	}

	function onChangeAddress(evt: React.ChangeEvent<HTMLInputElement>) {
		setAddress(evt.target.value)
	}

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

And we could be using [Immer](https://github.com/immerjs/immer) so we have immutable state,
but that's more boiler-plate.

## Examples

### Component state

Using the hook `useController` we create a `Controller` that reads and updates from the component's state.

In the component we use the Formalities components to create normal `<input>` elements,
but bound to the value of one of the `Controller`'s properties, and reporting changes back 
to the component state.

The `Formalities` components supports all of the regular `<input>` properties.

```typescript
import { useController, Formalities } from 'formalities'

interface MyFormState {
	name: string
	age?: number
	address: string
}

function MyForm() {
	const controller = useController<MyFormState>({
		name: '',
		address: '',
	})

	return (
		<div>
			<div>
				<label>Name:</label>
				<Formalities.Text controller={this.controller} prop="name" />
			</div>
			<div>
				<label>Address:</label>
				<Formalities.Text controller={this.controller} prop="address" />
			</div>
		</div>
	)
}
```

Formalities's `useController` returns a `Controller` with an initial value. The type of the `Controller` is
determined from that initial value.

The `<Formalities.Text>` component specifies the `Controller` instance via the `controller` prop, and which property
inside the controller via the `prop` prop. Due to the type-safety of the `Controller` the `prop` prop can only 
accept appropriate value.

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
	const controller = useController(props.value, props.onChange)

	return (
		<div>
			<div>
				<label>Full name:</label>
				<Formalities.Text controller={controller} prop="givenName" placeholder="Given name" />
				<Formalities.Text controller={controller} prop="familyName" placeholder="Family name" />
			</div>
		</div>
	)
}
```

### Custom components

In the examples above we've used Formalities's `<Formalities.String>` component replacement for the standard `<input>`
element. You can also create your own components that interact with the controller:

```typescript
import { Snapshot, wrapComponent } from 'formalities'

interface MyTextFieldProps extends Snapshot<string> {}

function MyTextField(props: MyTextFieldProps) {
	function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		props.setValue(evt.target.value)
	}

	return (
		<div>
			<input type="text" value={props.value} onChange={onChange} />
		</div>
	)

}

export default wrapComponent(MyTextField)
```

The last line above uses Formalities's to wrap `MyTextField`, which accepts props `value` and `setValue`, to create a component that instead accepts
props `controller` and `prop`.

It can then be used like `<Formalities.Text>` in the examples above, as in:

```typescript
import MyTextField from './MyTextField'

function MyForm() {
	const controller = useController(...)

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

Now when the `MyTextField` component wants to change its value, it calls the `setValue` function in its
props, which invokes the controller, which updates the state on the `MyForm` component, triggering React
to update, which updates the form.

### More examples

See the `packages/examples` directory for more examples.
