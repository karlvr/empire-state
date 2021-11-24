/**
 * An example of using empire-state-forms to manage undefined properties.
 */

import { Text, Snapshot, wrapComponent, useNewController, useSnapshotController, useSnapshot } from 'empire-state-forms'
import React from 'react'

interface MyFormState {
	myValue?: string
}

function UndefinedSnapshot(props: Snapshot<string | undefined>) {
	
	const controller = useSnapshotController(props)
	return (
		<Text controller={controller} prop="this" />
	)

}

const WrappedUndefinedSnapshot = wrapComponent(UndefinedSnapshot)

export default function Example8() {

	const controller = useNewController<MyFormState>({})
	const [state] = useSnapshot(controller)

	return (
		<div>
			<h1>Example 8: Undefined</h1>

			<Text controller={controller} prop="myValue" />
			<WrappedUndefinedSnapshot controller={controller} prop="myValue" /> 

			<h2>Summary</h2>
			{state.myValue || 'undefined'}
		</div>
	)
}
