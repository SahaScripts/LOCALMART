/**
 * LOCALMART / LocalSync Product Image Resolver
 * 
 * Maps real PostgreSQL / Spring Boot products to verified downloaded product images in `/assets/`.
 * Supports resolution by:
 * 1. Direct valid `imageUrl` on the product entity
 * 2. Primary `productId` matching real database IDs
 * 3. Fallback normalized `productName` matching
 * 
 * NOTE: The 5 hero carousel images (food.png, fashion.png, home decor.png,
 * beauty_wellness.png, statioanry.png) are strictly reserved for the homepage
 * hero carousel and are NOT used as product images.
 */

export interface ProductLike {
  productId?: number;
  productName?: string;
  imageUrl?: string;
}

// Database Product ID to Image Mapping
const PRODUCT_ID_IMAGE_MAP: Record<number, string> = {
  1: '/assets/chocolate-cake.jpeg',     // Chocolate Cake (ID: 1)
  2: '/assets/garlic-bread.jpeg',       // Garlic Bread (ID: 2)
  3: '/assets/veg-puff.jpeg',           // Veg Puff (ID: 3)
  4: '/assets/chocolate-brownie.jpeg',  // Chocolate Brownie (ID: 4)
  5: '/assets/candle.jpeg',             // Handmade Candle (ID: 5)
  6: '/assets/wooden-keychain.jpeg',    // Wooden Keychain (ID: 6)
  7: '/assets/gift-hamper.png',         // Gift Hamper (ID: 7)
  8: '/assets/wall-decor.jpeg',         // Handmade Wall Decor (ID: 8)
  10: '/assets/homemade-biscuit.jpeg',  // Homemade Biscuit (ID: 10)
  12: '/assets/hydroponic-salad-box.png',          // Hydroponic Salad Box (ID: 12)
  13: '/assets/fresh-wheatgrass-detox-juice.png',  // Fresh Wheatgrass Detox Juice (ID: 13)
};

// Normalized Product Name to Image Mapping
const PRODUCT_NAME_IMAGE_MAP: Record<string, string> = {
  'fresh wheatgrass detox juice': '/assets/fresh-wheatgrass-detox-juice.png',
  'wheatgrass detox juice': '/assets/fresh-wheatgrass-detox-juice.png',
  'fresh wheatgrass juice': '/assets/fresh-wheatgrass-detox-juice.png',
  'wheatgrass juice': '/assets/fresh-wheatgrass-detox-juice.png',
  'wheatgrass': '/assets/fresh-wheatgrass-detox-juice.png',
  'hydroponic salad box': '/assets/hydroponic-salad-box.png',
  'hydroponic salad': '/assets/hydroponic-salad-box.png',
  'salad box': '/assets/hydroponic-salad-box.png',
  'chocolate cake': '/assets/chocolate-cake.jpeg',
  'garlic bread': '/assets/garlic-bread.jpeg',
  'veg puff': '/assets/veg-puff.jpeg',
  'chocolate brownie': '/assets/chocolate-brownie.jpeg',
  'brownie': '/assets/chocolate-brownie.jpeg',
  'handmade candle': '/assets/candle.jpeg',
  'candle': '/assets/candle.jpeg',
  'wooden keychain': '/assets/wooden-keychain.jpeg',
  'wooden chain': '/assets/wooden-keychain.jpeg',
  'keychain': '/assets/wooden-keychain.jpeg',
  'gift hamper': '/assets/gift-hamper.png',
  'hamper': '/assets/gift-hamper.png',
  'handmade wall decor': '/assets/wall-decor.jpeg',
  'wall decor': '/assets/wall-decor.jpeg',
  'homemade biscuit': '/assets/homemade-biscuit.jpeg',
  'biscuit': '/assets/homemade-biscuit.jpeg',
  'biscuits': '/assets/homemade-biscuit.jpeg',
  'cake': '/assets/chocolate-cake.jpeg',
};

/**
 * Resolves the image URL for a given product or cart/order item.
 * Returns undefined if no verified product image is available (triggers graceful placeholder).
 */
export function getProductImageUrl(
  productOrName?: ProductLike | string | null,
  categoryName?: string
): string | undefined {
  if (!productOrName) return undefined;

  const product: ProductLike =
    typeof productOrName === 'string' ? { productName: productOrName } : productOrName;

  // 1. Direct valid imageUrl if already specified
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }

  // 2. Lookup by primary productId
  if (product.productId && PRODUCT_ID_IMAGE_MAP[product.productId]) {
    return PRODUCT_ID_IMAGE_MAP[product.productId];
  }

  // 3. Fallback lookup by normalized productName
  if (product.productName) {
    const normalized = product.productName.trim().toLowerCase().replace(/\s+/g, ' ');
    if (PRODUCT_NAME_IMAGE_MAP[normalized]) {
      return PRODUCT_NAME_IMAGE_MAP[normalized];
    }
    // Substring matching (keys ordered by specificity)
    for (const [key, path] of Object.entries(PRODUCT_NAME_IMAGE_MAP)) {
      if (normalized.includes(key)) {
        return path;
      }
    }
  }

  // Return undefined to trigger graceful placeholder
  return undefined;
}
