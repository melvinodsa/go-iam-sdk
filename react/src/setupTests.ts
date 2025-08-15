import '@testing-library/jest-dom';

// Setup global fetch mock for all tests
Object.defineProperty(window, 'fetch', {
    value: jest.fn(),
    writable: true
});
