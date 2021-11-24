# React Immutable State Controller

[![npm version](https://badge.fury.io/js/empire-state-react.svg)](https://badge.fury.io/js/empire-state-react)
[![Node CI](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml)

A small package to manage immutable state in a tree of [React](https://reactjs.org) components without a lot of boilerplate, but with a lot of type-safety.

## Installation

```shell
npm install empire-state-react
```

## Raison d’être

A difficulty with React’s `useState` (or component state in pre-hooks world) is that changes to state are not visible to code until the component re-renders. This is a _difficulty_ because it can lead to mistakes due to misunderstandings — it’s odd that `value` isn’t immediately changed after you’ve called `setValue` — and a strength because _immutability_ makes code safer and is fundamental to React.

Another difficulty with React’s `useState` is that the entire component subtree re-renders when the state changes. This is annoying if you have a component managing a large state object and delegating the modification of parts of that state to child components.

### Compared to Redux

[Redux](https://redux.js.org) provides a similar capability to `empire-state-react`, however with a lot more complexity and boilerplate. Also Redux is designed to manage global state in an application, where you really benefit from using reducers, selectors and actions, whereas `empire-state-react` is designed to improve the managing of local state in a tree of components.

## Solution

With `empire-state-react` you create one or more _controllers_ to contain state in a component, or at the root of a _tree_ of components that use that state. Using the _controller_ you can get and set _parts_ of its state, with re-renders limited to components that use the part of the state that has changed (using `useSnapshot`).

The `useSnapshot` hook works a little like React’s `useState`, except instead of creating a state value that’s local to the component, it always reflects and updates the value in the controller, where that controller has possibly been created in the current component or passed as `props` from a parent component.

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
	const controller = useNewController(person)

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

### `useNewController`

`useNewController(initialValue)` returns a new `Controller` that controls access to the state; whatever type that is.

The `Controller` has a `value` property to access the current state, and a `setValue` function to change that state. Changes to the `Controller`’s `value` are _immediately_ visible in code, but they _DO NOT_ trigger a re-render in React.

A `useNewController` hook always returns the _same_ `Controller` object, so passing a controller to child components will not cause a re-render even if the value in the controller has changed. That's why you need `useSnapshot` to re-render when state changes...

### `useController`

`useController(controller)` simply returns the given controller, but it will trigger re-renders when the value in the controller changes.
`useController` is useful if you're using the `Controller`'s `map`, `find` or `findIndex` methods and therefore need to re-render if the
controller's value changes.

### `useSnapshot`

`useSnapshot(controller)` and `useSnapshot(controller, property)` returns an array containing the current value (immutable) and a function to change the value (exactly like React’s `useState`).

The value originates from the `Controller`; either the whole value of the controller or one of its properties.

If the value is changed, either using `useSnapshot`’s `change` function, or any other snapshot’s `change` function, or even using the `Controller`’s own `setValue` function, the component _WILL_ re-render.

## Reference

See [`empire-state`](../core) for more information and an API reference for `Controller`s and `Snapshot`s.
