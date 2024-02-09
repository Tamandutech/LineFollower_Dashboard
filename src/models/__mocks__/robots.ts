const useRobots = jest.fn(() => ({
  robots: [
    {
      name: "Robot 1",
      id: "1",
      interface: "SPI",
      config: {
        services: {
          service1: {
            char1: "a",
            char2: "b",
          },
        },
      },
    },
  ],
  error: null,
  isLoading: false,
}));

module.exports = {
  useRobots,
};
