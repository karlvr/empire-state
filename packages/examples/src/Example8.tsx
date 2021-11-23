/**
 * An example of using Formalities to manage undefined properties.
 */

import { Formalities, Snapshot, wrapComponent, useNewController, useSnapshotController, useSnapshot } from 'formalities'
import React from 'react'

interface MyFormState {
	myValue?: string
}

function UndefinedSnapshot(props: Snapshot<string | undefined>) {
	
	const controller = useSnapshotController(props)
	return (
		<Formalities.Text controller={controller} prop="this" />
	)

}

const WrappedUndefinedSnapshot = wrapComponent(UndefinedSnapshot)

export default function Example8() {

	const controller = useNewController<MyFormState>({})
	const [state] = useSnapshot(controller)

	return (
		<div>
			<h1>Example 8: Undefined</h1>

			<Formalities.Text controller={controller} prop="myValue" />
			<WrappedUndefinedSnapshot controller={controller} prop="myValue" /> 

			<h2>Summary</h2>
			{state.myValue || 'undefined'}
		</div>
	)
}
