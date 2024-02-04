const useSettings = jest.fn(() => ({
  settings: {
    batteryLowWarningInterval: 1000,
    batteryLowWarningThreshold: 5000,
  },
}));

module.exports = {
  useSettings,
};
