const fs = require('fs')
const process = require('process')

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function processMarker(data, startMarker, endMarker, replacement, expected) {
	let start = 0
	let result = ''
	let i = data.indexOf(startMarker, start)
	while (i !== -1) {
		result += data.substring(start, i)

		let j = data.indexOf(endMarker, i)
		if (j !== -1) {
			const inspecting = data.substring(i, j + endMarker.length)
			const excluded = []
			// console.log(`Process ${inspecting}`)
			for (let k = 0; k < expected.length; k++) {
				if (inspecting.indexOf(expected[k]) === -1) {
					excluded.push(expected[k])
				}
			}
			if (excluded.length) {
				result += `Exclude<${replacement}, ${excluded.join(' | ')}>`
			} else {
				result += replacement
			}
			start = j + endMarker.length
		} else {
			console.error(`Found start marker without end marker at ${i}`)
			process.exit(1)
		}
		i = data.indexOf(startMarker, start)
	}

	result += data.substring(start)
	return result
}

const INTERFACE_END = '}\n'

function processInterface(data, name, replacement, startMarker, endMarker) {
	let i = data.indexOf(`interface ${name}`)
	if (i === -1) {
		console.error(`Cannot find interface ${name}`)
		process.exit(1)
	}

	let j = data.indexOf(INTERFACE_END, i)
	if (j === -1) {
		console.error(`Cannot find end of interface ${name}`)
		process.exit(1)
	}

	const expected = []
	const matches = data.substring(i, j).match(/[-a-zA-Z]+\??:/g)
	for (let k = 0; k < matches.length; k++) {
		const match = matches[k].replace(/\??:$/, '')
		expected.push(`"${match}"`)
	}
	data = data.substring(0, i) + data.substring(j + INTERFACE_END.length)

	data = data.replace(new RegExp(name, 'g'), replacement)
	return processMarker(data, startMarker, endMarker, `keyof ${replacement}`, expected)
}

fs.readFile('dist/components.d.ts', 'utf8', function (err, data) {
	if (err) {
		return console.error(err);
	}

	data = processInterface(data, 'XYZZY1', 'React.InputHTMLAttributes<HTMLInputElement>', '"xyzzy1"', '"yzzyx1"')
	data = processInterface(data, 'XYZZY2', 'React.TextareaHTMLAttributes<HTMLTextAreaElement>', '"xyzzy2"', '"yzzyx2"')
	
	fs.writeFile('dist/components.d.ts', data, 'utf8', function (err) {
		 if (err) {
			 return console.error(err);
		 }
	});
});
