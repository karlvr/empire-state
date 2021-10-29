/**
 * An example of using Formalities to manage a more complex form state.
 */

import React from 'react'
import { useController, Formalities, wrapComponent, Snapshot, useSnapshotController, useSnapshot } from 'formalities'

interface MyFormState {
	personalDetails?: PersonalDetails
	workDetails?: WorkDetails
}

interface PersonalDetails {
	givenName?: string
	familyName?: string
	mothersMaidenName?: string
	address?: Address
}

interface WorkDetails {
	businessName?: string
	address?: Address
}

interface Address {
	line1: string
	line2: string
	city: string
	postcode?: number
	country: string
}

const AddressComponent = wrapComponent(function(props: Snapshot<Address | undefined>) {
	const controller = useSnapshotController(props)

	return (
		<div>
			<h3>Address</h3>
			<div>
				<label>Line 1</label>
				<Formalities.Text controller={controller} prop="line1" />
			</div>
			<div>
				<label>Line 2</label>
				<Formalities.Text controller={controller} prop="line2" />
			</div>
			<div>
				<label>City</label>
				<Formalities.Text controller={controller} prop="city" />
			</div>
			<div>
				<label>Postcode</label>
				<Formalities.Number controller={controller} prop="postcode" />
			</div>
			<div>
				<label>Country</label>
				<Formalities.Text controller={controller} prop="country" />
			</div>
		</div>
	)
})

const PersonalDetailsComponent = wrapComponent(function(props: Snapshot<PersonalDetails | undefined>) {
	const controller = useSnapshotController(props)
	
	return (
		<div>
			<h2>Personal details</h2>
			<div>
				<label>Given name:</label>
				<Formalities.Text controller={controller} prop="givenName" />
			</div>
			<div>
				<label>Family name:</label>
				<Formalities.Text controller={controller} prop="familyName" />
			</div>
			<AddressComponent controller={controller} prop="address" />
		</div>
	)
})

const WorkDetailsComponent = wrapComponent(function(props: Snapshot<WorkDetails | undefined>) {
	const controller = useSnapshotController(props)

	return (
		<div>
			<h2>Work details</h2>
			<div>
				<label>Business name:</label>
				<Formalities.Text controller={controller} prop="businessName" />
			</div>
			<AddressComponent controller={controller} prop="address" />
		</div>
	)
})

const Example2: React.FC = function() {
	const controller = useController<MyFormState>({})
	const [state] = useSnapshot(controller)

	function renderAddress(address: Address) {
		return (
			<p>{address.line1}<br />{address.line2}<br />{address.city} {address.postcode}<br />{address.country}</p>
		)
	}

	return (
		<div>
			<h1>Example 2: Complex</h1>

			<PersonalDetailsComponent controller={controller} prop="personalDetails" />
			<WorkDetailsComponent controller={controller} prop="workDetails" />

			<h2>Summary</h2>
			{state.personalDetails && (
				<>
					<h3>Personal details</h3>
					<p>{state.personalDetails.givenName} {state.personalDetails.familyName}</p>
					{state.personalDetails.address && renderAddress(state.personalDetails.address)}
				</>
			)}
			{state.workDetails && (
				<>
					<h3>Work details</h3>
					<p>{state.workDetails.businessName}</p>
					{state.workDetails.address && renderAddress(state.workDetails.address)}
				</>
			)}
		</div>
	)
}

export default Example2
