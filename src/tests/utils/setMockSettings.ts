export const setMockSettings = () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
      });
    
      afterAll(() => {
        jest.resetAllMocks();
      });
}