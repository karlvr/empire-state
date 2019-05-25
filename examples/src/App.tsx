import * as React from 'react';

import Example1 from './Example1'
import Example2 from './Example2';
import Existing from './Existing'

export default class App extends React.Component {
	public render() {
		return (
			<div>
				<Existing />
				<hr />
				<Example1 />
				<hr />
				<Example2 />
			</div>
		);
	}
}
