import {defineConfig} from '@shopify/hydrogen/config';

export default defineConfig({
  shopify: {
    storeDomain: '*.myshopify.com',
    storefrontToken: 'your-token',
    storefrontApiVersion: '2022-07',
  },
});
