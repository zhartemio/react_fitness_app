module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    imageKitPublicKey: process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? '',
    imageKitUrlEndpoint: process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? '',
    imageKitAuthEndpoint: process.env.EXPO_PUBLIC_IMAGEKIT_AUTH_ENDPOINT ?? '',
  },
});
