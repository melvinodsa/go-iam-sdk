declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.MockedFunction<typeof fetch>;
    }
  }

  var fetch: jest.MockedFunction<typeof fetch>;
}

export {};
