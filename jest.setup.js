// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock fetch
const fetchMock = jest.fn((url, ...args) => {
    if (typeof url === 'string' && url.includes('jsonplaceholder.typicode.com/todos')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
        })
    }
    // Default mock for other requests
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('{}'),
        status: 200,
    })
})
global.fetch = fetchMock

// Mock NextResponse (from next/server) so that NextResponse.json(...) returns a valid Response-like object in tests
const { NextResponse } = require('next/server')
const originalNextResponseJson = NextResponse.json
NextResponse.json = (data, init) => {
    const res = originalNextResponseJson(data, init)
    // Add a .text() method so that tests can call res.text() (and then JSON.parse) if needed
    res.text = () => Promise.resolve(JSON.stringify(data))
    return res
}
global.NextResponse = NextResponse

// Mock TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Request/Response
const { Request, Response } = require('node-fetch')
global.Request = Request
global.Response = Response

// Mock NextRequest
class NextRequest extends Request {
    constructor(input, init) {
        super(input, init)
        this.nextUrl = new URL(input)
    }
}
global.NextRequest = NextRequest

// Reset mocks and global state before each test
beforeEach(() => {
    jest.clearAllMocks()
    global.tasks = []
})

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
}
global.localStorage = localStorageMock 