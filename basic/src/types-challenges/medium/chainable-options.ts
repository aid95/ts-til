import {Alike, Expect} from "../utils";

type Chainable<T = {}> = {
    option<K extends string, V extends any>(key: K, value: V): Chainable<T & { [key in K]: V }>
    get(): T
}

/* _____________ Test Cases _____________ */

declare const a: Chainable

const result1 = a
    .option('foo', 123)
    .option('bar', { value: 'Hello World' })
    .option('name', 'type-challenges')
    .get()

const result2 = a
    .option('name', 'another name')
    .option('name', 'last name')
    .get()

type cases = [
    Expect<Alike<typeof result1, Expected1>>,
    Expect<Alike<typeof result2, Expected2>>,
]

type Expected1 = {
    foo: number
    bar: {
        value: string
    }
    name: string
}

type Expected2 = {
    name: string
}
