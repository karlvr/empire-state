# Immutable State Controller

A small library to manage mutable and immutable state without a lot of boilerplate, but with a lot of type-safety using TypeScript.

`immutable-state-controller` lets you work with mutable state from the `Controller`, and immutable state from `Snapshot`s. Each `Controller` or `Snapshot` provides a method to change the state. Changes are visible immediately in the `Controller` as it represents mutable state, but changes are never visible in `Snapshot`s as they represent immutable state. To see changes in a `Snapshot` you need to get a new `Snapshot` from the `Controller`.

## Installation

```shell
npm install immutable-state-controller
```

## Usage

```typescript
import { withMutable } from 'immutable-state-controller'

const state = {
	a: 'Hello world',
	b: 42,
	c: {
		d: 'Nested okay',
		e: ['A', 'B', 'C', 'D'],
	},
}

const controller = withMutable(state)
```

You can obtain snapshots from the Controller of either the whole state, or of parts of the state.
Any changes you make via the Controller will be reflected immediately in the `state` object.

```typescript
const aSnapshot: Snapshot<string> = controller.snapshot('a')
// aSnapshot.value === 'Hello world'

aSnapshot.setValue('Bye bye')
// state.a === 'Bye bye'
```

However the snapshot value has not changed, ensuring that you retain a consistent, immutable view of the state:

```typescript
aSnapshot.value === 'Hello world'
```

Snapshots can be created for any type, including objects:

```typescript
const cSnapshot = controller.snapshot('c') // Snapshot<{ d: string, e: string[] }>
cSnapshot.value.d === 'Nested okay'

cSnapshot.setValue({
	d: 'Changed',
	e: ['E'],
})

state.c.d === 'Changed'
```

You can also create controllers for nested objects in order to access further nested snapshots:

```typescript
const eSnapshot = controller.controller('c').snapshot('e') // Snapshot<string[]>

eSnapshot.value == ['E']

eSnapshot.setValue(['F', 'G'])
state.c.e == ['F', 'G']
```

This pattern is powerful when sharing state between multiple pieces of code while wanting to
ensure an immutable and consistent view of that state; creating and sharing a new snapshot of the
state when appropriate.