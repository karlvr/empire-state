# Formalities

A small library to build React forms with immutable state, type-safety and not a lot of boilerplate.

Formalities makes use of [Immer](https://github.com/immerjs/immer) and [Immutable State Controller](https://github.com/karlvr/immutable-state-controller) to create immutable state updates.

## Install

```shell
npm install formalities
```

## The case for Formalities

This is how we usually manage form state in React components, while maintaining type-safety with
TypeScript:

```typescript
interface MyFormState {
	name?: string
	age?: number
	address?: string
}

const INITIAL_STATE: MyFormState = {}

class MyForm extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	public render() {
		return (
			<div>
				<h1>Existing</h1>
				<div>
					<label>Name:</label>
					<input type="text" value={this.state.name || ''} onChange={this.onChangeName} />
				</div>
				<div>
					<label>Age:</label>
					<input type="number" defaultValue={this.state.age !== undefined ? `${this.state.age}` : ''} onBlur={this.onChangeAge} />
				</div>
				<div>
					<label>Address:</label>
					<input type="text" value={this.state.address || ''} onChange={this.onChangeAddress} />
				</div>
				<h2>Output</h2>
				<div>Name: {this.state.name}</div>
				<div>Age: {this.state.age}</div>
				<div>Address: {this.state.address}</div>
			</div>
		)
	}

	private onChangeName = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			name: evt.target.value,
		})
	}

	private onChangeAge = (evt: React.FocusEvent<HTMLInputElement>) => {
		const age = parseInt(evt.target.value, 10)
		if (isNaN(age)) {
			evt.target.value = this.state.age !== undefined ? `${this.state.age}` : ''
			evt.target.select()
		} else {
			this.setState({
				age,
			})
		}
	}

	private onChangeAddress = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			address: evt.target.value,
		})
	}

}
```

And we could be using [Immer](https://github.com/immerjs/immer) so we have immutable state,
but that's more boiler-plate.

## Examples

### Component state

Using the hook `useController` we create a `Controller` that reads and updates from the component's state.

In the component we use the Formalities `Input` components to create a normal `<input>` element,
but bound to the value of one of the `Controller`'s properties, and reporting changes back 
to the component state.

The `Input` components supports all of the regular `<input>` properties.

```typescript
import { useController, Input } from 'formalities'

interface MyFormState {
	name: string
	age?: number
	address: string
}

function MyForm() {
	const controller = useController({
		name: '',
		address: '',
	})

	return (
		<div>
			<div>
				<label>Name:</label>
				<Input.Text controller={this.controller} prop="name" />
			</div>
			<div>
				<label>Address:</label>
				<Input.Text controller={this.controller} prop="address" />
			</div>
		</div>
	)
}
```

Formalities's `useController` returns a `Controller` with an initial value. The type of the `Controller` is
determined from that initial value.

The `<Input.String>` component specifies the `Controller` instance via the `controller` prop, and which property
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
				<Input.String controller={controller} prop="givenName" placeholder="Given name" />
				<Input.String controller={controller} prop="familyName" placeholder="Family name" />
			</div>
		</div>
	)
}
```

### Custom components

In the examples above we've used Formalities's `<Input.String>` component replacement for the standard `<input>`
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

It can then be used like `<Input.String>` in the examples above, as in:

```typescript
import MyTextField from './MyTextField'

function MyForm() {
	const controller = useController(...)

	return (
		<div>
			<div>
				<label>Name:</label>
				<MyTextField controller={this.controller} prop="name" />
			</div>
			<div>
				<label>Address:</label>
				<MyTextField controller={this.controller} prop="address" />
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
