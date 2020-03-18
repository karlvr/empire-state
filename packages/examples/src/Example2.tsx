/**
 * An example of using Changeling to manage a more complex form state.
 */

import { forComponentProps, forComponentState, Input, Snapshot, wrapComponent } from 'formalities-hocs'
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
	postcode?: number
	country: string
}

const INITIAL_STATE: MyFormState = {}

export default class Example2 extends React.Component<{}, MyFormState> {

	public state = INITIAL_STATE

	private controller = forComponentState(this)

	public render() {
		return (
			<div>
				<h1>Example 2: Complex</h1>

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

const AddressComponent = wrapComponent(class AddressComponentImpl extends React.Component<Snapshot<Address | undefined>> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<h3>Address</h3>
				<div>
					<label>Line 1</label>
					<Input.String controller={this.controller} prop="line1" />
				</div>
				<div>
					<label>Line 2</label>
					<Input.String controller={this.controller} prop="line2" />
				</div>
				<div>
					<label>City</label>
					<Input.String controller={this.controller} prop="city" />
				</div>
				<div>
					<label>Postcode</label>
					<Input.LazyNumber controller={this.controller} prop="postcode" />
				</div>
				<div>
					<label>Country</label>
					<Input.String controller={this.controller} prop="country" />
				</div>
			</div>
		)
	}

})

const PersonalDetailsComponent = wrapComponent(class PersonalDetailsComponentImpl extends React.Component<Snapshot<PersonalDetails | undefined>> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<h2>Personal details</h2>
				<div>
					<label>Given name:</label>
					<Input.String controller={this.controller} prop="givenName" />
				</div>
				<div>
					<label>Family name:</label>
					<Input.String controller={this.controller} prop="familyName" />
				</div>
				<AddressComponent controller={this.controller} prop="address" />
			</div>
		)
	}

})

const WorkDetailsComponent = wrapComponent(class WorkDetailsComponentImpl extends React.Component<Snapshot<WorkDetails | undefined>> {

	private controller = forComponentProps(this)

	public render() {
		return (
			<div>
				<h2>Work details</h2>
				<div>
					<label>Business name:</label>
					<Input.String controller={this.controller} prop="businessName" />
				</div>
				<AddressComponent controller={this.controller} prop="address" />
			</div>
		)
	}
})
