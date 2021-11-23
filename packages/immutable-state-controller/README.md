# Immutable State Controller

[![npm version](https://badge.fury.io/js/immutable-state-controller.svg)](https://badge.fury.io/js/immutable-state-controller)
[![Node CI](https://github.com/karlvr/immutable-state-controller/actions/workflows/github-actions-build.yml/badge.svg)](https://github.com/karlvr/immutable-state-controller/actions/workflows/github-actions-build.yml)

A small library to work with immutable state without a lot of boilerplate, but with a lot of type-safety using TypeScript.

`immutable-state-controller` lets you view and mutate state using a `Controller`, while also providing access to immutable copies of state using `Snapshot`s.

Each `Controller` or `Snapshot` provides a method to change the state. All changes are immediately visible in the `Controller`, but a `Snapshot` never changes.

## Installation

```shell
npm install immutable-state-controller
```

## Usage

```typescript
import { controllerWithInitialValue } from 'immutable-state-controller'

const controller = controllerWithInitialValue({
	a: 'Hello world',
	b: 42,
	c: {
		d: 'Nested okay',
		e: ['A', 'B', 'C', 'D'],
	},
})
```

You can obtain snapshots from the Controller of either the whole state, or of parts of the state.
Any changes you make via the Controller will be reflected immediately in the controller's `value`.

```typescript
const aSnapshot = controller.snapshot('a') // Snapshot<string>
// aSnapshot.value === 'Hello world'

aSnapshot.setValue('Bye bye')
// controller.value.a === 'Bye bye'
```

However the snapshot value has not changed, ensuring that you retain a consistent, immutable view of the state:

```typescript
// aSnapshot.value === 'Hello world'
```

Snapshots can be created for any type, including objects:

```typescript
const cSnapshot = controller.snapshot('c') // Snapshot<{ d: string, e: string[] }>
// cSnapshot.value.d === 'Nested okay'

cSnapshot.setValue({
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

eSnapshot.setValue(['F', 'G'])
// controller.value.c.e == ['F', 'G']
```

This pattern is powerful when sharing state between multiple pieces of code while wanting to
ensure an immutable and consistent view of that state; creating and sharing a new snapshot of the
state when appropriate.
