# Empire State - React

[![npm version](https://badge.fury.io/js/empire-state-react.svg)](https://badge.fury.io/js/empire-state-react)
[![Node CI](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml)

A small package to work with mutable state in a tree of [React](https://reactjs.org) components without a lot of boilerplate, immutability when you want it, and type-safety using TypeScript.

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

With `empire-state-react` you create one or more _controllers_ to contain state in a component, or at the root of a _tree_ of components that use that state. Using the _controller_ you can get and set _parts_ of its state, with re-renders limited to components that use the part of the state that has changed (using `useControllerValue` or `useController`).

The `useControllerValue` hook provides access to a value from the controller, and a function to change that value. When the value changes your component will re-render.

The `useController` hook signals that a component is using the value from the controller (or a nested property of the controller) and should be re-rendered when that value changes.

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
	const controller = useControllerWithInitialState(person)

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
	const [givenName, changeGivenName] = useControllerValue(controller, 'givenName')
	const [middleName, changeMiddleName] = useControllerValue(controller, 'middleName')
	const [familyName, changeFamilyName] = useControllerValue(controller, 'familyName')

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

Controllers use [`immer`](https://github.com/immerjs/immer) to ensure the immutability of the values they contain. The values that you get from a controller are immutable (frozen), so if you’re mutating an array or object value, you’ll need to use `immer`’s `produce` method to mutate it, or spread / copy it.

## Hooks

### `useControllerWithInitialState`

`useControllerWithInitialState(initialValue)` returns a `Controller` with the given initial value, much like `useState`.

The `Controller` has a `value` property to access the current state, and a `setValue` function to change that state. Changes to the `Controller`’s `value` are _immediately_ visible in code, but they _DO NOT_ trigger a re-render in React, unlike `useState`.

A `useControllerWithInitialState` hook always returns the _same_ `Controller` object, so passing a controller to child components will not cause a re-render even if the value in the controller has changed. That's why you need `useControllerValue` to re-render when state changes.

### `useControllerWithValue`

`useControllerWithValue(value)` returns a `Controller` with the given value.

The `Controller` has a `value` property to access the current state, and a `setValue` function to change that state. Changes to the `Controller`’s `value` are _immediately_ visible in code, but they _DO NOT_ trigger a re-render in React.

A `useControllerWithValue` hook always returns the _same_ `Controller` object, so passing a controller to child components will not cause a re-render even if the value in the controller has changed. That's why you need `useControllerValue` to re-render when state changes.

If the `value` parameter changes, the `Controller`'s state will be reset to the new value.

### `useControllerValue`

`useControllerValue(controller)` and `useControllerValue(controller, property)` returns an array containing the current value (immutable) and a function to change the value (exactly like React’s `useState`).

The value originates from the `Controller`; either the whole value of the controller or one of its properties.

If the value is changed, either using `useControllerValue`’s `change` function or the `Controller`’s `setValue` function, the component _WILL_ re-render.

### `useController`

`useController(controller)` simply returns the given controller, but it will trigger re-renders when the value in the controller changes.
`useController` is useful if you need to re-render if anything about the controller's value changes.

If you are using the `Controller`'s `map`, `find` or `findIndex` methods, consider using `useControllerLength` instead to only trigger re-renders
if the length of the array changes.

### `useControllerLength`

`useControllerLength(controller)`, like `useController`, returns the given controller, but `useControllerLength` only works with array values, and only triggers re-renders when
the array length changes. `useControllerLength` is using if you're using the `Controller`'s `map`, `find` or `findIndex` methods and therefore need to re-render if the
controller's value changes.

## Notes

### Deps

Any `Controller`s returned by hooks or by methods on `Controller` remain the same (`===`) for the life of the component,
even though the value it contains may change.

When using a `Controller` in a React `deps` array, such as with `useEffect` or `useCallback`, you can pass the `Controller`
instance itself as the dependency, and then always access the current value of the `Controller` within the function.

```typescript
const controller = useControllerWithInitialValue(true)
const handleClick = useCallback(function() {
	console.log(`The current value is ${controller.value}`)
}, [controller])
```

### Re-renders and `useControllerValue` vs `Controller`'s `value` property

Because `empire-state-react` allows mutable state (in a `Controller`) without re-renders, care must be taken to ensure that
components re-render when they need to.

Avoid using the `Controller`'s `value` property in a component's rendering, as using the value from a controller alone
does not result in re-rendering. Instead you should use `const [value] = useControllerValue(controller)` to access the value.

Conversely you _should_ use the `Controller`'s `value` property in a component's callback functions, as doing so provides
access to the current value without the usual requirement of recreating the function (using `useCallback`'s `deps` array)
whenever the value changes.

If you use a `Controller`'s other methods such as `map` or `find` when rendering then you should signal that use the
controller by using the `useController` hook. This hook can also be used to extract a nested controlller, as opposed to
using the `Controller'`s `get` method.

## Reference

See [`empire-state`](../core) for more information and an API reference for `Controller`s.
