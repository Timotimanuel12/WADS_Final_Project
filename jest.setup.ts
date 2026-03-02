import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
    getApps: jest.fn(() => []),
    getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    signInWithEmailAndPassword: jest.fn(),
}));

// Polyfill fetch and related web APIs for Node.js environment (required by Firebase)
import { fetch, Headers, Request, Response } from 'cross-fetch';

global.fetch = fetch as any;
global.Headers = Headers as any;
global.Request = Request as any;
global.Response = Response as any;