const ProductStore = (function () {
  'use strict';

  let cache = [];

  function getCategoryName(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.name : categoryId;
  }

  function getCategoryIcon(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.icon : '📦';
  }

  function getAll() {
    return cache.slice();
  }

  async function syncGlobalProducts() {
    try {
      const result = await apiRequest('/products');
      cache = result.ok ? result.products : [];
    } catch (_err) {
      cache = [];
    }

    window.PRODUCTS = cache;
    return cache;
  }

  async function addProduct(data, session) {
    if (!Auth.canPostProducts(session)) {
      return { ok: false, error: 'You do not have permission to add products.' };
    }

    try {
      const result = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          price: data.price,
          image: data.image,
          seller: data.seller,
          session
        })
      });

      if (result.ok) {
        await syncGlobalProducts();
      }

      return result;
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function removeProduct(productId, session) {
    if (!Auth.canRemoveProducts(session)) {
      return { ok: false, error: 'Only administrators can remove products.' };
    }

    try {
      const result = await apiRequest(`/products/${productId}`, {
        method: 'DELETE',
        body: JSON.stringify({ session })
      });

      if (result.ok) {
        await syncGlobalProducts();
      }

      return result;
    } catch (_err) {
      return { ok: false, error: 'Cannot reach server. Please try again.' };
    }
  }

  async function getBySeller(sellerId) {
    try {
      const result = await apiRequest(`/products/seller/${encodeURIComponent(sellerId)}`);
      return result.ok ? result.products : [];
    } catch (_err) {
      return [];
    }
  }

  return {
    getAll,
    syncGlobalProducts,
    addProduct,
    removeProduct,
    getBySeller,
    getCategoryName,
    getCategoryIcon
  };
})();
