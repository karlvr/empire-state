# React Immutable State Controller

[![npm version](https://badge.fury.io/js/react-immutable-state-controller.svg)](https://badge.fury.io/js/react-immutable-state-controller)
[![Node CI](https://github.com/karlvr/immutable-state-controller/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/immutable-state-controller/actions/workflows/github-actions-build.yml)

A small library to manage immutable state in a tree of React components without a lot of boilerplate, but with a lot of type-safety.

## Installation

```shell
npm install react-immutable-state-controller
```

## Raison d’être

A difficulty with React’s `useState` (or component state in pre-hooks world) is that changes to state are not visible to code until the component re-renders. This is a _difficulty_ because it can lead to mistakes due to misunderstandings — it’s odd that `value` isn’t immediately changed after you’ve called `setValue` — and a strength because _immutability_ makes code safer and is fundamental to React.

Another difficulty with React’s `useState` is that the entire component subtree re-renders when the state changes. This is annoying if you have a component managing a large state object and delegating the modification of parts of that state to child components.

### Compared to Redux

[Redux](https://redux.js.org) provides a similar capability to `react-immutable-state-controller`, however with a lot more complexity and boilerplate. Also Redux is designed to manage global state in an application, where you really benefit from using reducers, selectors and actions, whereas `react-immutable-state-controller` is designed to improve the managing of local state in a tree of components.

## Solution

With `react-immutable-state-controller` you create one or more _controllers_ to contain some state in a component, or at the root of a tree of components that use that state. Using the _controller_ you can get and set _parts_ of its state, with re-renders limited to components that use the part of the state that has changed (using `useSnapshot`).

## Example

```typescript
interface Person {
	name: Name
	address: Address
}

interface Name {
	givenName: string
	middleName?: string
	familyName: string
}

interface Address {
	street: string
}

function EditPersonComponent({ person: Person; onChange: (newPerson: Person) => void }) {
	const controller = useController(person)

	const handleSave = useCallback(function(evt: React.MouseEvent) {
		evt.preventDefault()
		onChange(controller.value)
	}, [controller])

	return (
		<>
		<EditName controller={controller.get('name')} />
		<EditAddress controller={controller.get('address')} />
		<button onClick={handleSave}>Save</button>
		</>
	)
}

function EditName(props: { controller: Controller<Name> }) {
	const [givenName, changeGivenName] = useSnapshot(controller)
	const [middleName, changeMiddleName] = useSnapshot(controller)
	const [familyName, changeFamilyName] = useSnapshot(controller)

	const handleGivenName = useCallback(function(evt: React.ChangeEvent<HTMLInputElement>) {
		changeGivenName(evt.target.value)
	}, [changeGivenName])

	return (
		<input type="text" value={givenName} onChange={handleGivenName} />
	)
}
```

In this example the `EditPersonComponent` will not re-render even though the `givenName` property is changing in the `controller`.

## Immutability

Controllers use [`immer`](https://github.com/immerjs/immer) to ensure the immutability of the values they contain. The values that you get from a controller or snapshot will be immutable (frozen), so if you’re mutating an array or object value, you’ll need to use `immer`’s `produce` method to mutate it, or spread / copy it.

## Hooks

### `useController`

`useController(initialValue)` returns a `Controller` that controls access to the state; whatever type that is.

The `Controller` has a `value` property to access the current state, and a `setValue` function to change that state. Changes to the `Controller`’s `value` are _immediately_ visible in code, but they _DO NOT_ trigger a re-render in React.

### `useSnapshot`

`useSnapshot(controller)` and `useSnapshot(controller, property)` returns an array containing the current value (immutable) and a function to change the value (exactly like React’s `useState`).

The value originates from the `controller`; either the whole value of the controller or one of its properties.

If the value is changed, either using `useSnapshot`’s change value function, or any other snapshot’s change value function, or even using the `controller`’s own `setValue` function, the component _WILL_ re-render.

## Controllers

A `Controller` manages a value. It is a generic type, where its type represents the type of value it contains.

Some examples of controllers:

* `Controller<string>` for a controller that simply contains a string value
* `Controller<Person>` for a controller that contains an object
* `Controller<Person[]>` for a controller that contains an array

### Accessing the value

You can get the value from the controller using the `value` property, and set it using the `setValue` method.

|Property / Method|Description|
|--------|-----------|
|`value`|The value in the controller.|
|`setValue(newValue: T)`|Set the value in the controller.|

Note that the value in the controller is _live_, ie. it is independent of React’s render cycle.

### Nested values

When the controller contains an array or an object, you can create sub-controllers to access specific parts of the controller. Changes in sub-controllers are immediately reflected in the parent controller.

#### Array controllers

When a controller contains an array value, these methods are applicable:

|Method|Description|
|------|-----------|
|`get(index: number)`|Returns a sub-controller for the value at the given index.|
|`map(callback)`|Map over the values. The callback receives a controller for each value as its first argument and an index as its second.|

#### Object controllers

When a controller contains an object value, these methods are applicable:

|Method|Description|
|------|-----------|
|`get(prop: string)`|Return a sub-controller for the value of the given property.|
|`get(prop: string, index: number)`|Returns a sub-controller for the value at the given index of the array in the given property.|
|`map(prop: string, callback)`|Map over the values in the given property. The callback receives a controller for each value as its first argument and an index as its second.|

### Listening for changes

You can add change listeners to a controller. The change listener will be called when the value in the controller is changed.

```typescript
controller.addChangeListener(function(newValue: T) {

})
```

## Links

`react-immutable-state-controller` is based upon [`immutable-state-controller`](../immutable-state-controller), which you may wish to read about to understand more about `Controller`s and `Snapshot`s.
