function normalizeImageKey(name) {
  return String(name).toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Stable, always-loadable product thumbnails (unique per category + name). */
const CATEGORY_IMAGE_IDS = {
  'living-room': [237, 238, 239, 240, 241, 242],
  kitchen: [292, 293, 294, 295, 296, 297],
  bathroom: [302, 303, 304, 305, 306, 307],
  artistic: [312, 313, 314, 315, 316, 317],
  outdoor: [322, 323, 324, 325, 326, 327],
  garage: [332, 333, 334, 335, 336, 337],
  bedroom: [342, 343, 344, 345, 346, 347],
  cleaning: [352, 353, 354, 355, 356, 357],
  pet: [362, 363, 364, 365, 366, 367],
  baby: [372, 373, 374, 375, 376, 377],
  default: [200, 201, 202, 203, 204, 205]
};

function getProductImage(name, categoryId) {
  const key = normalizeImageKey(name);
  const pool = CATEGORY_IMAGE_IDS[categoryId] || CATEGORY_IMAGE_IDS.default;
  const imageId = pool[hashString(`${categoryId || 'all'}-${key}`) % pool.length];
  const seed = encodeURIComponent(`${categoryId || 'all'}-${key}`);
  return `https://picsum.photos/id/${imageId}/120/120?seed=${seed}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getProductImage, normalizeImageKey };
}
