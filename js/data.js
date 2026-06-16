function generateSampleProducts() {
  const products = [];
  let id = 1;

  CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      const basePrice = Math.floor(Math.random() * 180000) + 15000;
      products.push({
        id: id++,
        name: item,
        category: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        image: getProductImage(item, cat.id),
        price: basePrice,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 120) + 5,
        seller: ['Kigali Home Store', 'Rwanda Decor Co.', 'Kitchen Plus RW', 'Furniture Hub'][Math.floor(Math.random() * 4)]
      });
    });
  });

  return products;
}

const PRODUCTS = generateSampleProducts();
