const CATEGORIES = [
  {
    id: 'living-room',
    name: 'Living Room',
    icon: '🛋️',
    color: '#c4a77d',
    items: [
      'Sofas', 'Armchairs', 'Recliners', 'Coffee tables', 'Side tables',
      'TV stands', 'Entertainment centers', 'Bookshelves', 'Display cabinets',
      'Console tables', 'Rugs', 'Carpets', 'Curtains', 'Curtain rods',
      'Throw pillows', 'Cushion covers', 'Floor lamps', 'Table lamps',
      'Ceiling lights', 'Wall clocks', 'Wall shelves', 'Bean bags', 'Ottomans',
      'Magazine racks', 'Artificial plants'
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: '🍳',
    color: '#7a9e7e',
    items: [
      'Cooking pots', 'Frying pans', 'Saucepans', 'Pressure cookers', 'Plates',
      'Bowls', 'Cups and mugs', 'Glasses', 'Cutlery sets', 'Knife sets',
      'Chopping boards', 'Serving trays', 'Food storage containers', 'Blenders',
      'Electric kettles', 'Rice cookers', 'Microwaves', 'Toasters', 'Dish racks',
      'Kitchen bins', 'Measuring cups', 'Spice racks', 'Water dispensers',
      'Aprons', 'Oven mitts'
    ]
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: '🚿',
    color: '#6ba3be',
    items: [
      'Towels', 'Bath mats', 'Shower curtains', 'Toilet brushes', 'Soap dispensers',
      'Toothbrush holders', 'Bathroom mirrors', 'Towel racks', 'Laundry baskets',
      'Toilet paper holders', 'Toilet seats', 'Bathroom cabinets', 'Storage shelves',
      'Waste bins', 'Bathrobes', 'Shower heads', 'Faucets', 'Toothpaste dispensers',
      'Bathroom organizers', 'Hair dryers', 'Toilet plungers', 'Squeegees',
      'Air fresheners', 'Hand towels', 'Bath sponges'
    ]
  },
  {
    id: 'artistic',
    name: 'Artistic & Decorative Accessories',
    icon: '🎨',
    color: '#d4846a',
    items: [
      'Wall paintings', 'Canvas art', 'Framed prints', 'Decorative mirrors', 'Vases',
      'Artificial flowers', 'Flower pots', 'Sculptures', 'Table centerpieces',
      'Candles', 'Candle holders', 'Photo frames', 'Decorative trays', 'Wall decals',
      'Wall stickers', 'Dream catchers', 'Decorative baskets', 'Figurines',
      'Globe ornaments', 'Lanterns', 'Fairy lights', 'Indoor fountains',
      'Decorative clocks', 'Seasonal decorations', 'Throw blankets'
    ]
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Garden',
    icon: '🌳',
    color: '#5c8a5c',
    items: [
      'Garden chairs', 'Outdoor tables', 'Patio sets', 'Sun umbrellas', 'Hammocks',
      'Garden benches', 'Garden flower pots', 'Watering cans', 'Garden hoses',
      'Hose reels', 'Lawn mowers', 'Garden shears', 'Rakes', 'Shovels',
      'Garden gloves', 'Wheelbarrows', 'Outdoor lighting', 'Bird feeders',
      'Plant stands', 'BBQ grills', 'Fire pits', 'Outdoor cushions',
      'Garden storage boxes', 'Artificial grass', 'Swing chairs'
    ]
  },
  {
    id: 'garage',
    name: 'Home Parking & Garage',
    icon: '🚗',
    color: '#6b7280',
    items: [
      'Toolboxes', 'Tool cabinets', 'Garage storage shelves', 'Wall hooks',
      'Extension cords', 'Car jacks', 'Tire inflators', 'Pressure washers',
      'Car vacuum cleaners', 'Car wash kits', 'Oil drain pans', 'Jumper cables',
      'Battery chargers', 'LED work lights', 'Garage cabinets', 'Folding ladders',
      'Workbenches', 'Fire extinguishers', 'First aid kits', 'Parking stoppers',
      'Bike racks', 'Garage floor mats', 'Security cameras', 'Motion sensor lights',
      'Padlocks'
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    color: '#8b7fa8',
    items: [
      'Beds', 'Mattresses', 'Bed frames', 'Headboards', 'Bedside tables',
      'Wardrobes', 'Dressing tables', 'Mirrors', 'Chest of drawers', 'Blanket boxes',
      'Pillows', 'Pillowcases', 'Bed sheets', 'Duvets', 'Comforters', 'Blankets',
      'Mattress protectors', 'Mosquito nets', 'Laundry hampers', 'Bedroom rugs',
      'Reading lamps', 'Alarm clocks', 'Clothes hangers', 'Shoe racks',
      'Storage organizers', 'Jewelry boxes', 'Curtain sets', 'Closet organizers',
      'Vanity stools', 'Full-length mirrors'
    ]
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Laundry',
    icon: '🧹',
    color: '#4a90a4',
    items: [
      'Brooms', 'Dustpans', 'Mops', 'Mop buckets', 'Vacuum cleaners',
      'Carpet cleaners', 'Steam mops', 'Cleaning cloths', 'Microfiber towels',
      'Scrub brushes', 'Cleaning toilet brushes', 'Window squeegees', 'Spray bottles',
      'Cleaning laundry baskets', 'Cleaning laundry hampers', 'Clothes drying racks',
      'Irons', 'Ironing boards', 'Washing machines', 'Fabric steamers', 'Clothespins',
      'Detergent dispensers', 'Cleaning gloves', 'Floor cleaners', 'Room air fresheners',
      'Lint rollers', 'Storage caddies', 'Stain removers', 'Dishwashing supplies',
      'Trash bins'
    ]
  },
  {
    id: 'pet',
    name: 'Pet Supplies',
    icon: '🐶',
    color: '#b8860b',
    items: [
      'Pet food bowls', 'Pet water dispensers', 'Automatic feeders', 'Pet food containers',
      'Treat jars', 'Pet beds', 'Pet blankets', 'Pet mats', 'Pet carriers',
      'Travel crates', 'Seat covers', 'Leashes', 'Collars', 'Harnesses', 'ID tags',
      'Pet brushes', 'Pet combs', 'Nail clippers', 'Pet shampoos', 'Pet towels',
      'Chew toys', 'Pet balls', 'Rope toys', 'Interactive toys', 'Litter boxes',
      'Litter scoops', 'Waste bags', 'Pee pads', 'Flea combs', 'Pet first aid kits'
    ]
  },
  {
    id: 'baby',
    name: 'Baby & Kids',
    icon: '👶',
    color: '#e8a0bf',
    items: [
      'Baby cots', 'Cribs', 'Toddler beds', 'Changing tables', 'Nursery chairs',
      'High chairs', 'Baby bottles', 'Bottle sterilizers', 'Bottle warmers', 'Bibs',
      'Feeding sets', 'Diaper bags', 'Diaper organizers', 'Baby wipes containers',
      'Changing mats', 'Strollers', 'Car seats', 'Baby carriers', 'Baby monitors',
      'Safety gates', 'Cabinet locks', 'Corner protectors', 'Bed rails',
      'Baby bathtubs', 'Bath thermometers', 'Hooded towels', 'Educational toys',
      'Building blocks', 'Activity mats', 'Story books', 'Drawing boards',
      'Musical toys', 'Baby wardrobes', 'Toy storage bins', "Children's hangers",
      "Kids' laundry baskets"
    ]
  }
];

const CATALOG_PRODUCT_COUNT = CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORIES, CATALOG_PRODUCT_COUNT };
}
