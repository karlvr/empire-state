/**
 * An example of using Changeling to manage a more complex form state.
 */

import { forComponentProps, forComponentState, Input, LazyInput, Snapshot, wrapComponent } from 'changeling'
import * as React from 'react'

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
	postcode: number
	country: string
}

const INITIAL_STATE: MyFormState = {}

export default class Example2 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 2</h1>

				<PersonalDetailsComponent controller={this.controller} prop="personalDetails" />
				<WorkDetailsComponent controller={this.controller} prop="workDetails" />

				<h2>Summary</h2>
				{this.state.personalDetails && (
					<>
						<h3>Personal details</h3>
						<p>{this.state.personalDetails.givenName} {this.state.personalDetails.familyName}</p>
						{this.state.personalDetails.address && this.renderAddress(this.state.personalDetails.address)}
					</>
				)}
				{this.state.workDetails && (
					<>
						<h3>Work details</h3>
						<p>{this.state.workDetails.businessName}</p>
						{this.state.workDetails.address && this.renderAddress(this.state.workDetails.address)}
					</>
				)}
			</div>
		)
	}

	private renderAddress(address: Address) {
		return (
			<p>{address.line1}<br />{address.line2}<br />{address.city} {address.postcode}<br />{address.country}</p>
		)
	}

}

const AddressComponent = wrapComponent(class AddressComponentImpl extends React.Component<Snapshot<Address>> {

	private controller = forComponentProps(this)

	public render() {
		return(
			<div>
				<h3>Address</h3>
				<div>
					<label>Line 1</label>
					<Input controller={this.controller} prop="line1" />
				</div>
				<div>
					<label>Line 2</label>
					<Input controller={this.controller} prop="line2" />
				</div>
				<div>
					<label>City</label>
					<Input controller={this.controller} prop="city" />
				</div>
				<div>
					<label>Postcode</label>
					<LazyInput controller={this.controller} prop="postcode" convert={this.toNumber} />
				</div>
				<div>
					<label>Country</label>
					<Input controller={this.controller} prop="country" />
				</div>
			</div>
		)
	}

	private toNumber(value: string): number | undefined {
		const result = parseInt(value, 10)
		if (isNaN(result)) {
			return undefined
		}
		return result
	}

})

const PersonalDetailsComponent = wrapComponent(class PersonalDetailsComponentImpl extends React.Component<Snapshot<PersonalDetails>> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<h2>Personal details</h2>
				<div>
					<label>Given name:</label>
					<Input controller={this.controller} prop="givenName" />
				</div>
				<div>
					<label>Family name:</label>
					<Input controller={this.controller} prop="familyName" />
				</div>
				<AddressComponent controller={this.controller} prop="address" />
			</div>
		)
	}

})

const WorkDetailsComponent = wrapComponent(class WorkDetailsComponentImpl extends React.Component<Snapshot<WorkDetails>> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<h2>Work details</h2>
				<div>
					<label>Business name:</label>
					<Input controller={this.controller} prop="businessName" />
				</div>
				<AddressComponent controller={this.controller} prop="address" />
			</div>
		)
	}
})
