import {
  gql,
  useShopQuery,
  useServerAnalytics,
  useRouteParams,
  ShopifyAnalyticsConstants,
  Seo,
} from "@shopify/hydrogen";
import { Suspense } from "react";

import type { Product } from '@shopify/hydrogen/storefront-api-types';

import { Layout } from "../../components/Layout.server";
import ProductDetails from "../../components/ProductDetails.client";

// ...other imports
import groq from 'groq';
import useSanityQuery from '../../hooks/useSanityQuery';

type ShopifyPayload = {
  product: Product
};

const QUERY_SANITY = groq`
  *[
    _type == 'product'
    && store.slug.current == $slug
  ][0]{
    _id,
    "available": !store.isDeleted && store.status == 'active',
    "gid": store.gid,
    "slug": store.slug.current,
    body,
    "variants": store.variants[]->{
      "id": store.gid,
      dimensions
    }
  }
`;

export default function ProductRoute({ params }) {
  const { handle } = useRouteParams();

  // Fetch Sanity document
  const {data: sanityProduct} = useSanityQuery({
    params: {slug: handle},
    query: QUERY_SANITY,
  });

  const { data: { product } }: {data: { product: Product }} = useShopQuery<ShopifyPayload>({
    query: PRODUCT_QUERY,
    variables: {
      handle,
    },
  });

  useServerAnalytics({
    shopify: {
      pageType: ShopifyAnalyticsConstants.pageType.product,
      resourceId: product.id,
    },
  });

  return (
    <Layout>
      <Suspense>
        <Seo type="product" data={product} />
      </Suspense>
      <ProductDetails product={product} sanityProduct={sanityProduct} />
    </Layout>
  );
}

const PRODUCT_QUERY = gql`
  fragment MediaFields on Media {
    mediaContentType
    alt
    previewImage {
      url
    }
    ... on MediaImage {
      id
      image {
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      vendor
      descriptionHtml
      media(first: 7) {
        nodes {
          ...MediaFields
        }
      }
      variants(first: 100) {
        nodes {
          id
          availableForSale
          compareAtPriceV2 {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
          priceV2 {
            amount
            currencyCode
          }
          sku
          title
          unitPrice {
            amount
            currencyCode
          }
        }
      }
      seo {
        description
        title
      }
    }
  }
`;
