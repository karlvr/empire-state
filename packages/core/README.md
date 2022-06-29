# Empire State

[![npm version](https://badge.fury.io/js/empire-state.svg)](https://badge.fury.io/js/empire-state)
[![Node CI](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/empire-state/actions/workflows/github-actions-build.yml)

A small package to work with mutable state without a lot of boilerplate, immutability when you want it, and type-safety using TypeScript.

`empire-state` lets you view and mutate state using a `Controller`, while also providing access to immutable copies of state using `Snapshot`s.

Each `Controller` or `Snapshot` provides a method to change the state. All changes are immediately visible in the `Controller`, but a `Snapshot` never changes.

## Installation

```shell
npm install empire-state
```

## Example

```typescript
import { controllerWithInitialValue } from 'empire-state'

const controller = controllerWithInitialValue({
	a: 'Hello world',
	b: 42,
	c: {
		d: 'Nested okay',
		e: ['A', 'B', 'C', 'D'],
	},
})

controller.get('a').setValue('Bye bye')

const immutableValue = controller.snapshot('c')
```

## Snapshots

A `Snapshot` is an immutable snapshot of the state from a controller.

You can obtain snapshots from the `Controller` of either the whole state, or of parts of the state.
Any changes you make via the `Controller` will be reflected immediately in the controller's `value`,
but the `Snapshot` never changes as it is immutable — ensuring that you retain a consistent, immutable view of the state.

```typescript
const aSnapshot = controller.snapshot('a') // Snapshot<string>
// aSnapshot.value === 'Hello world'

aSnapshot.change('Bye bye')
// controller.value.a === 'Bye bye'
// aSnapshot.value === 'Hello world'
```

Snapshots can be created for any type, including objects:

```typescript
const cSnapshot = controller.snapshot('c') // Snapshot<{ d: string, e: string[] }>
// cSnapshot.value.d === 'Nested okay'

cSnapshot.change({
	d: 'Changed',
	e: ['E'],
})

// controller.value.c.d === 'Changed'
// cSnapshot.value.d === 'Nested okay'
```

You can also create controllers for nested objects in order to access further nested snapshots:

```typescript
const eSnapshot = controller.get('c').snapshot('e') // Snapshot<string[]>

// eSnapshot.value == ['E']

eSnapshot.change(['F', 'G'])
// controller.value.c.e == ['F', 'G']
```

This pattern is powerful when sharing state between multiple pieces of code while wanting to
ensure an immutable and consistent view of that state; creating and sharing a new snapshot of the
state when appropriate.

## Changing values

You can change the value in a `Controller` either by using a `Snapshot`, as above, or by using the `setValue` or `set` methods
on the `Controller`. The `setValue` method sets the entire value of the `Controller`. The `set` method can identify a nested
value in the `Controller` and change that.

You can also obtain a _function_ that changes a value in the `Controller` when the function is called. Use `onChange(...)` to obtain
a function that changes the specific value in the `Controller` when it is called. Use `onToggle(...)` to obtain a function that
toggles a boolean value when called.

## Nested controllers

You can obtain a controller for a nested value. Any changes to the nested controller are
also reflected in the parent controller.

```typescript
const cController = controller.get('c')
cController.setValue({
	d: 'Gone',
	e: [],
})
```

Array `Controller`s also support `map` and `find` to access nested controllers:

```typescript
const eController = controller.get('e')
eController.map((controller: Controller<string>, index: number, array: string[]) => controller.value.toLowerCase()) == ['a', 'b', 'c', 'd']

const ecController = eController.find((value: string, index: number, array: string[]) => value === 'C')
ecController.setValue('c')
```

## Controller reference

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

You can also obtain functions to change the value for the controller, or for a property in the controller:

|Method|Description|
|--------|-----------|
|`onToggle`|Return a function that toggles the boolean value in the controller|
|`onChange`|Return a function to change the value in the controller|

### Nested values

When the controller contains an array or an object, you can create sub-controllers to access specific parts of the controller. Changes in sub-controllers are immediately reflected in the parent controller.

#### Array controllers

When a controller contains an array value, these methods are applicable:

|Method|Description|
|------|-----------|
|`get(index: number)`|Returns a sub-controller for the value at the given index.|
|`set(index: number, newValue)`|Set the value at the given index.|
|`map(callback)`|Map over the values. The callback receives a controller for each value as its first argument and an index as its second.|
|`find(predicate)`|Returns the first value in the controller that matches the predicate. The predicate signature is `(value: T, index: number, array: T[]) => boolean`. The `find` method returns a `Controller` for the found value, or `undefined` if not found.|
|`findIndex(predicate)`|Returns the index of the first value in the controller that matches the predicate. The predicate signature is `(value: T, index: number, array: T[]) => boolean`.|
|`push('this', newValue)`|Push a new value into the array value in the controller|
|`pushNew('this')`|Return a sub-controller that adds a value to the array value in this controller when it first receives a new value|
|`remove('this', predicate)`|Remove values from the array value in the controller using a predicate function. The predicate signature is `(value: T, index: number, array: T[]) => boolean`.|
|`onToggle(index: number)`|Return a function that toggles the boolean value in the array in the controller|
|`onChange(index: number)`|Return a function to change the value in the array in the controller|

#### Object controllers

When a controller contains an object value, these methods are applicable:

|Method|Description|
|------|-----------|
|`get(prop: string)`|Return a sub-controller for the value of the given property.|
|`set(prop: string, newValue)`|Set the value of the given property.|
|`get(prop: string, index: number)`|Returns a sub-controller for the value at the given index of the array in the given property.|
|`map(prop: string, callback)`|Map over the values in the given array-valued property. The callback receives a controller for each value as its first argument and an index as its second.|
|`find(prop: string, predicate)`|Returns the first value in the given array-valued property that matches the predicate. The predicate signature is `(value: T, index: number, array: T[]) => boolean`. The `find` method returns a `Controller` for the found value, or `undefined` if not found.|
|`findIndex(prop: string, predicate)`|Returns the index of the first value in the given array-values property that matches the predicate. The predicate signature is `(value: T, index: number, array: T[]) => boolean`.|
|`push(prop: string, newValue)`|Push a new value into the given array-valued property|
|`pushNew(prop: string)`|Return a sub-controller that adds a value to the given array-valued property when it first receives a new value|
|`remove(prop: string, predicate)`|Remove values from the given array-valued property using a predicate function. The predicate signature is `(value: T, index: number, array: T[]) => boolean`.|
|`onToggle(prop: string)`|Return a function that toggles the boolean value in the property in the controller|
|`onToggle(prop: string, index: number)`|Return a function that toggles the boolean value in the array in the property in the controller|
|`onChange(prop: string)`|Return a function to change the value in the property in the controller|
|`onChange(prop: string, index: number)`|Return a function to change the value in the array in the property in the controller|

### Listening for changes

You can add change listeners to a controller. The change listener will be called when the value in the controller is changed.

```typescript
controller.addChangeListener(function(newValue: T) {

})
```

Listeners can also be removed:

```typescript
controller.removeChangeListener(listenerFunc)
```

Listeners can be added with a "tag" and then removed all at once:

```typescript
controller.addChangeListener(listenerFunc, 'myTag')
controller.removeAllChangeListeners('myTag')
```

Or all change listeners can be removed:

```typescript
controller.removeAllChangeListeners()
```
