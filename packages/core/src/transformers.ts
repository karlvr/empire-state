/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, ControllerTransformer } from './types'


const nullToUndefinedTransformer: ControllerTransformer<any, any> = {
	to(value) {
		if (value === null) {
			return undefined
		} else {
			return value
		}
	},
	from(value) {
		if (value === undefined) {
			return null
		} else {
			return value
		}
	},
}

const nullOrUndefinedToUndefinedTransformer: ControllerTransformer<any, any> = {
	to(value) {
		if (value === null) {
			return undefined
		} else {
			return value
		}
	},
	from(value) {
		return value
	},
}

const undefinedToNullTransformer: ControllerTransformer<any, any> = {
	to(value) {
		if (value === undefined) {
			return null
		} else {
			return value
		}
	},
	from(value) {
		if (value === null) {
			return undefined
		} else {
			return value
		}
	},
}

const numberToStringTransformer: ControllerTransformer<any, any> = {
	to(value) {
		if (typeof value === 'number') {
			return String(value)
		} else {
			return value
		}
	},
	from(value) {
		if (typeof value === 'string') {
			return Number(value)
		} else {
			return value
		}
	},
}

const stringToNumberTransformer: ControllerTransformer<any, any> = {
	to(value) {
		if (typeof value === 'string') {
			return Number(value)
		} else {
			return value
		}
	},
	from(value) {
		if (typeof value === 'number') {
			return String(value)
		} else {
			return value
		}
	},
}

export function transformNullToUndefined<T extends null | unknown>(controller: Controller<T>): Controller<Exclude<T, null> | undefined> {
	return controller.transform(nullToUndefinedTransformer)
}

export function transformNullOrUndefinedToUndefined<T extends undefined | null | unknown>(controller: Controller<T>): Controller<Exclude<T, null>> {
	return controller.transform(nullOrUndefinedToUndefinedTransformer)
}

export function transformUndefinedToNull<T extends undefined | unknown>(controller: Controller<T>): Controller<Exclude<T, undefined> | null> {
	return controller.transform(undefinedToNullTransformer)
}

export function transformNumberToString<T extends number | unknown>(controller: Controller<T>): Controller<string | Exclude<T, number>> {
	return controller.transform(numberToStringTransformer)
}

export function transformStringToNumber<T extends string | unknown>(controller: Controller<T>): Controller<number | Exclude<T, string>> {
	return controller.transform(stringToNumberTransformer)
}
