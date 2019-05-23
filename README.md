# Changeling

A small library to help manage changing state without a lot of boilerplate.

Changeling makes use of [Immer](https://github.com/immerjs/immer) to create immutable state updates.

## Example

A custom React text field component for use in our form:

```typescript
/**
 * The props that my custom text field component expects, extends Changeable from Changeling,
 * indicating that it expects to manage a `string` value.
 */
interface MyTextFieldProps extends Changeable<string> {
	title: string
}

class MyTextField extends React.Component<MyTextFieldProps> {

	public render() {
		return (
			<div>
				<label>
					{this.props.title}:
					<input type="text" value={this.props.value} onChange={this.onChange} />
				</label>
			</div>
		)
	}

	private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(evt.target.value)
	}

}

/**
 * Export a wrapped component that accepts a Changling and a property name as its props.
 * The wrapping HOC converts that into the `onChange` and `value` props required by the
 * `Changeable` interface.
 */
export const MyWrappedTextField = wrapComponent(MyTextField)
```

Now we use the custom text field in a form:

```typescript
/**
 * An interface to describe the contents of my form.
 */
interface MyFormContents {
	name: string
	age?: number
	address: string
}

/**
 * An interface to describe the React component state for my form. It defines a property,
 * which must be named `value` with the type of the form contents.
 */
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
	 * Create a Changeling to help manage the state when the component is created.
	 */
	private changeling = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>My Form</h1>
				<MyWrappedTextField changeling={this.changeling} title="Name" name="name" />
				<MyWrappedTextField changeling={this.changeling} title="Address" name="address" />

				<h2>Summary</h2>
				<p>Name: {this.state.value.name}</p>
				<p>Address: {this.state.value.address}</p>
			</div>
		)
	}
}
```

Now when the `MyTextField` component wants to change its value, it calls the `onChange` function in its
props, which invokes the Changeling, which calls `setState` on the `MyForm` component to update the form
state.

This works because `MyForm` has `state` that contains a `value` property.

You can also use Changeling on a component that has `value` and `onChange` properties in its props:

```typescript
interface MyFormProps {
	onChange: (newFormContents: MyFormContents) => void
	value: MyFormContents
}

class MyForm extends React.Component<{MyFormProps> {

	private changeling = forComponentProps(this)

	public render() {
		...
	}

}
```

Changeling exports an interface to describe this combination of `value` and `onChange`, so
you could rewrite `MyFormProps` as:

```typescript
interface MyFormProps extends Changeable<MyFormContents> {}
```

Similarly Changeling exports an interface to describe a state containing just the `value` property,
so you could write `MyFormState` as:

```typescript
interface MyFormState extends ChangeableState<MyFormContents> {}
```
