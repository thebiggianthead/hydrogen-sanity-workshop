import {
  ProductOptionsProvider,
  MediaFile,
  useProductOptions,
  OptionWithValues,
  ProductPrice,
  BuyNowButton,
  AddToCartButton,
} from "@shopify/hydrogen";

import {PortableText} from '@portabletext/react'

import { Product, MediaConnection } from "@shopify/hydrogen/storefront-api-types";
type MediaNodes = MediaConnection['nodes'];

type SanityProductPage = {
  _id: string;
  available: boolean;
  gid: string;
  slug: string;
  body: [];
  variants: [{
    id: string;
    dimensions: {
      width: number;
      height: number;
    }
  }]
};

export default function ProductDetails({ product, sanityProduct }: { product: Product; sanityProduct: SanityProductPage; }) {
  return (
    <ProductOptionsProvider data={product}>
      <section className="w-full overflow-x-hidden gap-4 md:gap-8 grid px-6 md:px-8 lg:px-12">
        <div className="grid items-start gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid md:grid-flow-row  md:p-0 md:overflow-x-auto md:grid-cols-2 md:w-full lg:col-span-2">
            <div className="md:col-span-2 snap-center card-image aspect-square md:w-full w-[80vw] shadow rounded">
              <ProductGallery media={product.media.nodes} />
            </div>
          </div>
          <div className="sticky md:mx-auto max-w-xl md:max-w-[24rem] grid gap-8 p-0 md:p-6 md:px-0 top-[6rem] lg:top-[8rem] xl:top-[10rem]">
            <div className="grid gap-2">
              <h1 className="text-4xl font-bold leading-10 whitespace-normal">
                {product.title}
              </h1>
              <span className="max-w-prose whitespace-pre-wrap inherit text-copy opacity-50 font-medium">
                {product.vendor}
              </span>
            </div>
            <ProductForm product={product} sanityProduct={sanityProduct} />
            <div className="mt-8">
              <div
                className="prose border-t border-gray-200 pt-6 text-black text-md">
                <PortableText value={sanityProduct.body} components={{
                  types: {
                    blockCallout: ({value}) => {
                      const {text, link} = value
                      return (
                        <div className="mr-auto flex flex-col items-start">
                          {link ? (
                            <a href={link} className="mt-4 text-4xl">
                              {text}
                            </a>
                          ) : (
                            <div className='text-4xl'>
                              {text}
                            </div>
                          )}
                        </div>
                      )
                    }
                  }}}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProductOptionsProvider>
  );
}

function ProductForm({ product, sanityProduct }: { product: Product, sanityProduct: SanityProductPage }) {
  const { options, selectedVariant } = useProductOptions();
  const currentSanityVariant = sanityProduct && selectedVariant && sanityProduct.variants.find(variant => variant.id === selectedVariant.id)

  return (
    <form className="grid gap-10">
      {
        <div className="grid gap-4">
          {(options as OptionWithValues[]).map(({ name, values }) => {
            if (values.length === 1) {
              return null;
            }
            return (
              <div
                key={name}
                className="flex flex-wrap items-baseline justify-start gap-6"
              >
                <legend className="whitespace-pre-wrap max-w-prose font-bold text-lead min-w-[4rem]">
                  {name}
                </legend>
                <div className="flex flex-wrap items-baseline gap-4">
                  <OptionRadio name={name} values={values} />
                </div>
              </div>
            );
          })}
        </div>
      }
      {selectedVariant && (
        <>
          {currentSanityVariant?.dimensions?.width && currentSanityVariant?.dimensions?.height && (
            <div>
              <span className="inline rounded-full text-xs font-bold bg-slate-500 text-white p-2 px-4">
                {`${currentSanityVariant?.dimensions?.width}mm x ${currentSanityVariant?.dimensions?.height}mm`}
              </span>
            </div>
          )}
          <div>
            <ProductPrice
              className="text-gray-500 line-through text-lg font-semibold"
              priceType="compareAt"
              variantId={selectedVariant.id}
              data={product}
            />
            <ProductPrice
              className="text-gray-900 text-lg font-semibold"
              variantId={selectedVariant.id}
              data={product}
            />
          </div>
          <div className="grid items-stretch gap-4">
            <PurchaseMarkup />
          </div>
        </>
      )}
    </form>
  );
}

function PurchaseMarkup() {
  const { selectedVariant } = useProductOptions();
  const isOutOfStock = !selectedVariant?.availableForSale || false;

  return (
    <>
      {selectedVariant && selectedVariant.id && (
        <>
          <AddToCartButton
            type="button"
            variantId={selectedVariant.id}
            quantity={1}
            accessibleAddingToCartLabel="Adding item to your cart"
            disabled={isOutOfStock}
          >
            <span className="bg-black text-white inline-block rounded-sm font-medium text-center py-3 px-6 max-w-xl leading-none w-full">
              {isOutOfStock ? "Sold out" : "Add to cart"}
            </span>
          </AddToCartButton>
          {isOutOfStock ? (
            <span className="text-black text-center py-3 px-6 border rounded-sm leading-none ">
              Available in 2-3 weeks
            </span>
          ) : (
            <BuyNowButton variantId={selectedVariant.id}>
              <span className="inline-block rounded-sm font-medium text-center py-3 px-6 max-w-xl leading-none border w-full">
                Buy it now
              </span>
            </BuyNowButton>
          )}
        </>
      )}
    </>
  );
}

function OptionRadio({ values, name } : OptionWithValues) {
  const { selectedOptions, setSelectedOption } = useProductOptions();

  return (
    <>
      {selectedOptions && values.map((value) => {
        const checked = selectedOptions[name] === value;
        const id = `option-${name}-${value}`;

        return (
          <label key={id} htmlFor={id}>
            <input
              className="sr-only"
              type="radio"
              id={id}
              name={`option[${name}]`}
              value={value}
              checked={checked}
              onChange={() => setSelectedOption(name, value)}
            />
            <div
              className={`leading-none border-b-[2px] py-1 cursor-pointer transition-all duration-200 ${
                checked ? "border-gray-500" : "border-neutral-50"
              }`}
            >
              {value}
            </div>
          </label>
        );
      })}
    </>
  );
}

function ProductGallery({ media }: { media: MediaNodes }) {
  if (!media.length) {
    return null;
  }

  return (
    <div
      className={`grid gap-4 overflow-x-scroll grid-flow-col md:grid-flow-row  md:p-0 md:overflow-x-auto md:grid-cols-2 w-screen md:w-full lg:col-span-2`}
    >
      {media.map((med, i) => {
        let extraProps = {};

        if (med.mediaContentType === "MODEL_3D") {
          extraProps = {
            interactionPromptThreshold: "0",
            ar: true,
            loading: "eager",
            disableZoom: true,
          };
        }

        const data = {
          ...med,
          image: {
            ...med.previewImage,
            altText: med.alt || "Product image",
          },
        };

        return (
          <div
            className={`${
              i % 3 === 0 ? "md:col-span-2" : "md:col-span-1"
            } snap-center card-image bg-white aspect-square md:w-full w-[80vw] shadow-sm rounded`}
            key={med.id || med.image.id}
          >
            <MediaFile
              tabIndex="0"
              className={`w-full h-full aspect-square object-cover`}
              data={data}
              options={{
                crop: "center",
              }}
              {...extraProps}
            />
          </div>
        );
      })}
    </div>
  );
}
