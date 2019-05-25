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

In the component we use changeling's `Input` component to create a normal `<input>` element,
but bound to the value of one of the `Changeling`'s properties, and reporting changes back 
to the `Changeling`.

The `Input` component supports all of the regular `<input>` properties.

```typescript
import { forComponentState, Input } from 'changeling'

interface MyFormContents {
	name: string
	age?: number
	address: string
}

interface MyFormState {
	value: MyFormContents
}

class MyForm extends React.Component<{}, MyFormState> {

	/**
	 * Initialise the component state when the component is created.
	 */
	public state: MyFormState = {
		value: {
			name: '',
			address: '',
		},
	}

	/**
	 * Create a Changeling to manage the state.
	 */
	private changeling = forComponentState(this)

	public render() {
		return (
			<div>
				<div>
					<label>Name:</label>
					<Input changeling={this.changeling} changeable="name" />
				</div>
				<div>
					<label>Address:</label>
					<Input changeling={this.changeling} changeable="address" />
				</div>
			</div>
		)
	}
}
```

Changeling's `fromComponentState` returns a `Changeling` that gets and sets the `value` property in 
the component's state.

The `<Input>` component specifies the `Changeling` instance via the `changeling` prop, and which property
inside the `Changeling`'s object value via the `changeable` prop.

To make this pattern even terser, Changeling exports an interface `ChangeableState` which you can use
to define `MyFormState` like this:

```typescript
interface MyFormState extends ChangeableState<MyFormContents> {}
```

You can of course add your own properties to this interface. Or, if you don't have any additional properties
to add, do away with `MyFormState` entirely, and simply write:

```typescript
class MyForm extends React.Component<{}, ChangeableState<MyFormContents>> {
```

## Component props example

Not all components manage their own state. Many components only use props to receive state and to
report changes.

In this example the component is a part of a form, reporting changes back to the parent component via
the `onChange` function in its props. Changeling uses the `value` and `onChange` properties from the props
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

class MyFormSection extends React.Component<MyFormSectionProps> {

	private changeling = forComponentProps(this)

	public render() {
		return (
			<div>
				<div>
					<label>Full name:</label>
					<Input changeling={this.changeling} changeable="givenName" placeholder="Given name" />
					<Input changeling={this.changeling} changeable="familyName" placeholder="Family name" />
				</div>
			</div>
		)
	}

}
```

Changeling also exports an interface to describe this combination of `value` and `onChange`, so
you could rewrite `MyFormSectionProps` as:

```typescript
import { Changeable } from 'changeling'

interface MyFormSectionProps extends Changeable<MyFormSectionContents> {}
```

### Custom editing components

In the examples above we've used Changeling's `<Input>` component replacement for the standard `<input>`
element. You can also create your own components that interact with Changeling:

```typescript
interface MyTextFieldProps extends Changeable<string> {}

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

Note that the last line use's Changeling's [HOC](https://reactjs.org/docs/higher-order-components.html) to
wrap `MyTextField`, which accepts props `value` and `onChange`, to instead export a component that accepts
props `changeling` and `changeable`.

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
					<MyTextField changeling={this.changeling} changeable="name" />
				</div>
				<div>
					<label>Address:</label>
					<MyTextField changeling={this.changeling} changeable="address" />
				</div>
			</div>
		)
	}

}

```

Now when the `MyTextField` component wants to change its value, it calls the `onChange` function in its
props, which invokes the Changeling, which calls `setState` on the `MyForm` component to update the form
state.

## API

### Creating

```typescript
/** From a component's props */
function forComponentProps<T>(component: React.Component<T>): Changeling<T>

/** From a component's state */
function forComponentState<T>(component: React.Component<any, T>): Changeling<T>

/** From a property in a component's state */
function forComponentStateProperty<T, K extends keyof T>(component: React.Component<any, T>, property: K): Changeling<T[K]>

/** Custom Changeling with your own functions to return the current value, and to accept changes. */
function withFuncs<T>(value: () => T, onChange: (newValue: T) => void): Changeling<T>
```

### Interfaces

```typescript
/** The controller */
interface Changeling<T> {
	/** Returns a Changeable for this Changeling */
	changeable(): Changeable<T>

	/** Returns a Changeable for the named property of this Changeling */
	changeable(name: string): Changeable<T[K]>

	/** Returns a new Changling for the named property of this Changeling */
	changeling(name: string): Changeling<T[K]>

	/** Set a function to post-process values obtained from this Changeling for the named property */
	getter<K extends CP<T>>(name: K, func: (value: CPH<T>[K]) => CPH<T>[K]): void

	/** Set a function to pre-process changed values in this Changeling for the named property */
	setter<K extends CP<T>>(name: K, func: (value: CPH<T>[K]) => CPH<T>[K]): void
}

/** A snapshot of a value, and a function to change it. */
interface Changeable<T> {
	readonly onChange: (value: T) => void
	readonly value: T
}
```