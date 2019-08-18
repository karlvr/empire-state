import * as React from 'react'

import Example1 from './Example1'
import Example2 from './Example2'
import Example3 from './Example3'
import Example4 from './Example4'
import Example4a from './Example4a'
import Example5 from './Example5'
import Example6 from './Example6'
import Example7 from './Example7'
import Example8 from './Example8'
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
				<hr />
				<Example3 />
				<hr />
				<Example4 />
				<hr />
				<Example4a />
				<hr />
				<Example5 />
				<hr />
				<Example6 />
				<hr />
				<Example7 />
				<hr />
				<Example8 />
			</div>
		)
	}
}
