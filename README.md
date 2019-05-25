# Changeling

A small library to help manage changing state without a lot of boilerplate.

Changeling makes use of [Immer](https://github.com/immerjs/immer) to create immutable state updates.

## Without Changeling

This is how we usually manage form state in React components, while maintaining typesafety with
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

## With Changeling

## Component state example

Using the function `forComponentState` we create a `Changeling` that reads and updates
the component's state.

In the component we use Changeling's `Input` component to create a normal `<input>` element,
but bound to the value of one of the `Changeling`'s properties, and reporting changes back 
to the `Changeling`.

The `Input` component supports all of the regular `<input>` properties.

```typescript
import { forComponentState, Input } from 'changeling'

interface MyFormState {
	name: string
	age?: number
	address: string
}

class MyForm extends React.Component<{}, MyFormState> {

	/**
	 * Initialise the component state when the component is created.
	 */
	public state: MyFormState = {
		name: '',
		address: '',
	}

	/**
	 * Create a Changeling to manage the state.
	 */
	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<div>
					<label>Name:</label>
					<Input controller={this.controller} prop="name" />
				</div>
				<div>
					<label>Address:</label>
					<Input controller={this.controller} prop="address" />
				</div>
			</div>
		)
	}
}
```

Changeling's `fromComponentState` returns a `Controller` that gets and sets the properties in 
the component's state.

The `<Input>` component specifies the `Controller` instance via the `controller` prop, and which property
inside the controller via the `prop` prop.

## Component props example

Not all components manage their own state. Many components only use props to receive state and to
report changes.

In this next example the component is a part of a form, reporting changes back to its parent component via
the `onChange` function in its props. The controller uses the `value` and `onChange` properties from the props
to handle this automatically for you, or you can specify the name of the value and change function properties.

```typescript
interface MyFormSectionContents {
	givenName?: string
	familyName?: string
}

interface MyFormSectionProps {
	onChange: (newValue: MyFormSectionContents) => void
	value: MyFormSectionContents
}

class MyFormSection extends React.Component<MyFormSectionProps> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<div>
					<label>Full name:</label>
					<Input controller={this.controller} prop="givenName" placeholder="Given name" />
					<Input controller={this.controller} prop="familyName" placeholder="Family name" />
				</div>
			</div>
		)
	}

}
```

Changeling exports an interface to describe this combination of `value` and `onChange`, so
you could rewrite `MyFormSectionProps` as:

```typescript
import { Snapshot } from 'changeling'

interface MyFormSectionProps extends Snapshot<MyFormSectionContents> {}
```

### Custom components

In the examples above we've used Changeling's `<Input>` component replacement for the standard `<input>`
element. You can also create your own components that interact with the controller:

```typescript
interface MyTextFieldProps extends Snapshot<string> {}

class MyTextField extends React.Component<MyTextFieldProps> {

	public render() {
		return (
			<div>
				<input type="text" value={this.props.value} onChange={this.onChange} />
			</div>
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(evt.target.value)
	}

}

export default wrapComponent(MyTextField)
```

The last line above uses Changeling's [HOC](https://reactjs.org/docs/higher-order-components.html) to
wrap `MyTextField`, which accepts props `value` and `onChange`, to create a component that instead accepts
props `controller` and `prop`.

It can then be used like `<Input>` in the examples above, as in:

```typescript
import MyTextField from './MyTextField'

class MyForm extends React.Component<{}, MyFormState> {

	...

	public render() {
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

}

```

Now when the `MyTextField` component wants to change its value, it calls the `onChange` function in its
props, which invokes the controller, which calls `setState` on the `MyForm` component to update the form
state.

## API

### Creating

```typescript
/** From a component's props */
function forComponentProps<T>(component: React.Component<T>): Controller<T>

/** From a component's state */
function forComponentState<T>(component: React.Component<any, T>): Controller<T>

/** From a named property in a component's state */
function forComponentStateProperty<T, K extends keyof T>(component: React.Component<any, T>, property: K): Controller<T[K]>

/** Custom Changeling with your own functions to return the current value, and to accept changes. */
function withFuncs<T>(value: () => T, onChange: (newValue: T) => void): Controller<T>
```

### Interfaces

```typescript
/**
 * A controller for the value of type T from some source.
 * 
 * The type `V` in function definitions below is used to indicate the type of a given named property in `T`.
 */
interface Controller<T> {

	/** Returns a new sub-controller for the named property of this controller */
	controller(name: string): Controller<V>

	/** Returns a Snapshot of the controller's value */
	snapshot(): Snapshot<T>

	/** Returns a Snapshot of the named property of this Changeling */
	snapshot(name: string): Snapshot<V>

	/** Set a function to process values read for the named property */
	getter(name: string, func: (value: V) => V): void

	/** Set a function to process changed values for the named property */
	setter(name: string, func: (value: V) => V): void
}

/** A snapshot of a value, and the function to change it. */
interface Snapshot<T> {
	readonly value: T
	readonly onChange: (newValue: T) => void
}
```
