module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for expo-router
      "expo-router/babel",
      ["@babel/plugin-transform-private-methods", { loose: true }],
      [
        "babel-plugin-rewrite-require",
        {
          aliases: {
            "stream/web": "stream-browserify",
            "util/types": "util",
          },
        },
      ],
    ],
  };
};
