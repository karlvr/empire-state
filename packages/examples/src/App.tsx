import React from 'react'

import Example1 from './Example1Text'
import Example2 from './Example2CustomComponents'
import Example3 from './Example3Manual'
import Example4 from './Example4Checkable'
import Example4a from './Example4MultiCheckable'
import Example5 from './Example5Select'
import Example6 from './Example6Repeating'
import Example7 from './Example7Indexed'
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
