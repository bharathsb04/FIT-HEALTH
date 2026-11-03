/**
 * Fit Health Supplement Dynamic Product & Image Mapping
 * 
 * Maps every verified fitness supplement to its authentic product packaging image,
 * local high-resolution fallback image, verified shopping links, and store pricing.
 */

export const DEFAULT_FALLBACK_IMAGE = '/images/supplements/supplement-fallback.svg';

export const SUPPLEMENT_PRODUCT_CATALOG = {
  sup_1: {
    id: 'sup_1',
    name: 'Whey Protein Isolate & Concentrate',
    brand: 'Optimum Nutrition / MuscleBlaze Biozyme',
    category: 'Protein',
    imageUrl: '/images/supplements/whey-protein-isolate.jpg',
    fallbackImage: '/images/supplements/whey-protein-isolate.jpg',
    price: 54.99,
    inrPrice: '₹4,299',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Fast Prime Delivery', inrPrice: '₹4,299', url: 'https://www.amazon.in/s?k=optimum+nutrition+whey+protein+gold+standard' },
      { store: 'Cultstore', badge: 'Cult.fit Official', inrPrice: '₹3,999', url: 'https://www.cult.fit/store/nutrition/proteins' },
      { store: 'MyProtein', badge: 'Direct Factory', inrPrice: '₹3,899', url: 'https://www.myprotein.co.in/nutrition/protein.list' },
      { store: 'iHerb', badge: 'Global Verified', inrPrice: '₹4,350', url: 'https://www.iherb.com/c/whey-protein' }
    ]
  },
  sup_2: {
    id: 'sup_2',
    name: 'Micronized Creatine Monohydrate (Creapure)',
    brand: 'Creapure / MuscleBlaze / Thorne',
    category: 'Strength',
    imageUrl: '/images/supplements/creapure-creatine-monohydrate.jpg',
    fallbackImage: '/images/supplements/creapure-creatine-monohydrate.jpg',
    price: 24.99,
    inrPrice: '₹1,299',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Best Seller', inrPrice: '₹1,299', url: 'https://www.amazon.in/s?k=creatine+monohydrate+creapure' },
      { store: 'Cultstore', badge: 'Cult.fit Verified', inrPrice: '₹1,199', url: 'https://www.cult.fit/store/nutrition/creatine' },
      { store: 'Nutrabay', badge: 'Authenticity Guaranteed', inrPrice: '₹1,249', url: 'https://nutrabay.com/product-category/creatine' }
    ]
  },
  sup_3: {
    id: 'sup_3',
    name: 'C4 Explosive Pre-Workout & Beta-Alanine',
    brand: 'Cellucor / Gorilla Mind / Fast&Up',
    category: 'Endurance',
    imageUrl: '/images/supplements/c4-explosive-preworkout.jpg',
    fallbackImage: '/images/supplements/c4-explosive-preworkout.jpg',
    price: 34.99,
    inrPrice: '₹2,499',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Top Rated', inrPrice: '₹2,499', url: 'https://www.amazon.in/s?k=cellucor+c4+pre+workout' },
      { store: 'Cultstore', badge: 'Cult Certified', inrPrice: '₹2,349', url: 'https://www.cult.fit/store/nutrition/pre-workout' },
      { store: 'iHerb', badge: 'Special Deal', inrPrice: '₹2,420', url: 'https://www.iherb.com/c/pre-workout-formulas' }
    ]
  },
  sup_4: {
    id: 'sup_4',
    name: 'BCAAs 2:1:1 + Electrolytes Intra-Workout',
    brand: 'Scivation XTEND / Fast&Up BCAA',
    category: 'Endurance',
    imageUrl: '/images/supplements/xtend-bcaas-electrolytes.jpg',
    fallbackImage: '/images/supplements/xtend-bcaas-electrolytes.jpg',
    price: 28.99,
    inrPrice: '₹1,999',
    rating: 4.7,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Prime Deal', inrPrice: '₹1,999', url: 'https://www.amazon.in/s?k=xtend+bcaa+intra+workout' },
      { store: 'Cultstore', badge: 'Cult Store Special', inrPrice: '₹1,849', url: 'https://www.cult.fit/store/nutrition/bcaa' },
      { store: 'MyProtein', badge: 'Direct Factory', inrPrice: '₹1,899', url: 'https://www.myprotein.co.in/sports-nutrition/bcaa.list' }
    ]
  },
  sup_5: {
    id: 'sup_5',
    name: 'Triple Strength Omega-3 Fish Oil (EPA & DHA)',
    brand: 'Nordic Naturals / MuscleBlaze / TrueBasics',
    category: 'Joint',
    imageUrl: '/images/supplements/triple-strength-omega3.jpg',
    fallbackImage: '/images/supplements/triple-strength-omega3.jpg',
    price: 29.99,
    inrPrice: '₹1,199',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Choice Award', inrPrice: '₹1,199', url: 'https://www.amazon.in/s?k=triple+strength+omega+3+fish+oil' },
      { store: 'Cultstore', badge: 'Cult Verified', inrPrice: '₹1,099', url: 'https://www.cult.fit/store/nutrition/omega-3' },
      { store: 'iHerb', badge: 'IFOS Rated', inrPrice: '₹1,250', url: 'https://www.iherb.com/c/omega-3-fish-oil' }
    ]
  },
  sup_6: {
    id: 'sup_6',
    name: 'Fast&Up Reload Effervescent Electrolytes',
    brand: 'Fast&Up / Liquid I.V. / LMNT',
    category: 'Hydration',
    imageUrl: '/images/supplements/fastandup-reload-electrolytes.jpg',
    fallbackImage: '/images/supplements/fastandup-reload-electrolytes.jpg',
    price: 16.99,
    inrPrice: '₹699',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Lightning Fast', inrPrice: '₹699', url: 'https://www.amazon.in/s?k=fast+and+up+reload+electrolytes' },
      { store: 'Cultstore', badge: 'Official Partner', inrPrice: '₹599', url: 'https://www.cult.fit/store/nutrition/hydration' },
      { store: 'Flipkart', badge: 'Super Saver', inrPrice: '₹649', url: 'https://www.flipkart.com/search?q=fast+and+up+reload' }
    ]
  },
  sup_7: {
    id: 'sup_7',
    name: 'MuscleTech Platinum Multi-Vitamin & Minerals',
    brand: 'MuscleTech / Thorne / GNC',
    category: 'Micro',
    imageUrl: '/images/supplements/muscletech-platinum-multivitamin.jpg',
    fallbackImage: '/images/supplements/muscletech-platinum-multivitamin.jpg',
    price: 19.99,
    inrPrice: '₹1,099',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Best Value', inrPrice: '₹1,099', url: 'https://www.amazon.in/s?k=muscletech+platinum+multivitamin' },
      { store: 'Cultstore', badge: 'Cult Approved', inrPrice: '₹999', url: 'https://www.cult.fit/store/nutrition/vitamins' },
      { store: 'iHerb', badge: 'Global Verified', inrPrice: '₹1,150', url: 'https://www.iherb.com/c/multivitamins' }
    ]
  },
  sup_8: {
    id: 'sup_8',
    name: 'KSM-66 Organic Ashwagandha (5% Withanolides)',
    brand: 'Himalaya / NutraBio / Organic India',
    category: 'Joint',
    imageUrl: '/images/supplements/ksm66-organic-ashwagandha.jpg',
    fallbackImage: '/images/supplements/ksm66-organic-ashwagandha.jpg',
    price: 21.99,
    inrPrice: '₹899',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Top Organic Pick', inrPrice: '₹899', url: 'https://www.amazon.in/s?k=ksm+66+ashwagandha+organic' },
      { store: 'Cultstore', badge: 'Cult Wellness', inrPrice: '₹799', url: 'https://www.cult.fit/store/nutrition/ayurveda' },
      { store: 'Flipkart', badge: 'Fast Delivery', inrPrice: '₹849', url: 'https://www.flipkart.com/search?q=ksm+66+ashwagandha' }
    ]
  },
  sup_9: {
    id: 'sup_9',
    name: 'ZMA Night Recovery (Zinc, Magnesium & B6)',
    brand: 'Universal Nutrition / NOW Sports / MuscleBlaze',
    category: 'Micro',
    imageUrl: '/images/supplements/zma-night-recovery.jpg',
    fallbackImage: '/images/supplements/zma-night-recovery.jpg',
    price: 23.99,
    inrPrice: '₹999',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Sleep & Recovery Best', inrPrice: '₹999', url: 'https://www.amazon.in/s?k=zma+zinc+magnesium+recovery' },
      { store: 'iHerb', badge: 'Official SNAC', inrPrice: '₹949', url: 'https://www.iherb.com/c/zma' },
      { store: 'Nutrabay', badge: 'Verified Seller', inrPrice: '₹980', url: 'https://nutrabay.com/product-category/zma' }
    ]
  },
  sup_10: {
    id: 'sup_10',
    name: 'Pintola All-Natural Peanut Butter (Crunchy / 100% Roasted Peanuts)',
    brand: 'Pintola',
    category: 'Healthy Fats & Nut Butters',
    imageUrl: '/images/supplements/pintola-all-natural-peanut-butter.jpg',
    fallbackImage: '/images/supplements/pintola-all-natural-peanut-butter.jpg',
    price: 6.49,
    inrPrice: '₹449',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Amazon\'s Choice', inrPrice: '₹449', url: 'https://www.amazon.in/s?k=pintola+all+natural+peanut+butter+crunchy' },
      { store: 'Cultstore', badge: 'Official Store', inrPrice: '₹419', url: 'https://www.cult.fit/store/nutrition/peanut-butter' },
      { store: 'Flipkart', badge: 'Super Deal', inrPrice: '₹429', url: 'https://www.flipkart.com/search?q=pintola+peanut+butter' }
    ]
  },
  sup_11: {
    id: 'sup_11',
    name: 'MyFitness High Protein Dark Chocolate Peanut Butter',
    brand: 'MyFitness',
    category: 'Healthy Fats & Nut Butters',
    imageUrl: '/images/supplements/myfitness-chocolate-peanut-butter.jpg',
    fallbackImage: '/images/supplements/myfitness-chocolate-peanut-butter.jpg',
    price: 8.99,
    inrPrice: '₹599',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Top Seller', inrPrice: '₹599', url: 'https://www.amazon.in/s?k=myfitness+chocolate+peanut+butter+crunchy' },
      { store: 'Cultstore', badge: 'Cult Verified', inrPrice: '₹569', url: 'https://www.cult.fit/store/nutrition/peanut-butter' },
      { store: 'Flipkart', badge: 'Fast Delivery', inrPrice: '₹580', url: 'https://www.flipkart.com/search?q=myfitness+chocolate+peanut+butter' }
    ]
  },
  sup_12: {
    id: 'sup_12',
    name: 'MuscleBlaze High Protein Dark Chocolate Oats (with Probiotics)',
    brand: 'MuscleBlaze',
    category: 'Breakfast & Super Grains',
    imageUrl: '/images/supplements/muscleblaze-high-protein-oats.jpg',
    fallbackImage: '/images/supplements/muscleblaze-high-protein-oats.jpg',
    price: 9.99,
    inrPrice: '₹699',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Top Breakfast Pick', inrPrice: '₹699', url: 'https://www.amazon.in/s?k=muscleblaze+high+protein+dark+chocolate+oats' },
      { store: 'Cultstore', badge: 'Cult Nutrition', inrPrice: '₹649', url: 'https://www.cult.fit/store/nutrition/oats' },
      { store: 'Nutrabay', badge: 'Direct Factory', inrPrice: '₹675', url: 'https://nutrabay.com/product-category/oats' }
    ]
  },
  sup_13: {
    id: 'sup_13',
    name: 'Quaker 100% Wholegrain Rolled Oats',
    brand: 'Quaker',
    category: 'Breakfast & Super Grains',
    imageUrl: '/images/supplements/quaker-rolled-oats.jpg',
    fallbackImage: '/images/supplements/quaker-rolled-oats.jpg',
    price: 3.99,
    inrPrice: '₹249',
    rating: 4.8,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Pantry Best Seller', inrPrice: '₹249', url: 'https://www.amazon.in/s?k=quaker+rolled+oats+1kg' },
      { store: 'Blinkit', badge: '10-Min Delivery', inrPrice: '₹239', url: 'https://blinkit.com/s/?q=quaker+oats' },
      { store: 'Flipkart', badge: 'Super Value', inrPrice: '₹245', url: 'https://www.flipkart.com/search?q=quaker+oats+1kg' }
    ]
  },
  sup_14: {
    id: 'sup_14',
    name: 'MuscleBlaze High Protein Crunchy Dark Chocolate Muesli',
    brand: 'MuscleBlaze',
    category: 'Breakfast & Super Grains',
    imageUrl: '/images/supplements/muscleblaze-protein-muesli.jpg',
    fallbackImage: '/images/supplements/muscleblaze-protein-muesli.jpg',
    price: 10.49,
    inrPrice: '₹749',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Choice Award', inrPrice: '₹749', url: 'https://www.amazon.in/s?k=muscleblaze+high+protein+muesli+dark+chocolate' },
      { store: 'Cultstore', badge: 'Cult Verified', inrPrice: '₹699', url: 'https://www.cult.fit/store/nutrition/muesli' },
      { store: 'Nutrabay', badge: 'Authenticity Guard', inrPrice: '₹720', url: 'https://nutrabay.com/product-category/muesli' }
    ]
  },
  sup_15: {
    id: 'sup_15',
    name: 'Dymatize ISO 100 Hydrolyzed 100% Whey Isolate',
    brand: 'Dymatize',
    category: 'Protein',
    imageUrl: '/images/supplements/dymatize-iso100-whey.jpg',
    fallbackImage: '/images/supplements/dymatize-iso100-whey.jpg',
    price: 89.99,
    inrPrice: '₹7,499',
    rating: 4.9,
    shoppingLinks: [
      { store: 'Amazon', badge: 'Global Gold Pick', inrPrice: '₹7,499', url: 'https://www.amazon.in/s?k=dymatize+iso+100+hydrolyzed+whey' },
      { store: 'Cultstore', badge: 'Cult Verified', inrPrice: '₹7,199', url: 'https://www.cult.fit/store/nutrition/proteins' },
      { store: 'iHerb', badge: 'Official USA Import', inrPrice: '₹7,350', url: 'https://www.iherb.com/c/dymatize' }
    ]
  },
  sup_16: {
    id: 'sup_16',
    name: 'MyProtein Impact Whey Protein & Flavdrops',
    brand: 'MyProtein',
    category: 'Protein',
    imageUrl: '/images/supplements/whey-protein-isolate.jpg',
    fallbackImage: '/images/supplements/whey-protein-isolate.jpg',
    price: 49.99,
    inrPrice: '₹3,499',
    rating: 4.8,
    shoppingLinks: [
      { store: 'MyProtein', badge: 'Direct Factory Deals', inrPrice: '₹3,499', url: 'https://www.myprotein.co.in/nutrition/protein.list' },
      { store: 'Amazon', badge: 'Prime Superfast', inrPrice: '₹3,649', url: 'https://www.amazon.in/s?k=myprotein+impact+whey' },
      { store: 'Cultstore', badge: 'Cult Official', inrPrice: '₹3,550', url: 'https://www.cult.fit/store/nutrition/proteins' }
    ]
  }
};

/**
 * Resolves a supplement entity with authoritative product and image mapping.
 * Ensures imageUrl, fallbackImage, and shoppingLinks are guaranteed to exist.
 */
export function resolveSupplementProduct(sup = {}) {
  const mapData = SUPPLEMENT_PRODUCT_CATALOG[sup.id] || {};
  
  const imageUrl = sup.imageUrl || sup.image || mapData.imageUrl || DEFAULT_FALLBACK_IMAGE;
  const fallbackImage = sup.fallbackImage || mapData.fallbackImage || DEFAULT_FALLBACK_IMAGE;
  const shoppingLinks = (sup.shoppingLinks && sup.shoppingLinks.length > 0)
    ? sup.shoppingLinks
    : ((sup.buyLinks && sup.buyLinks.length > 0) ? sup.buyLinks : (mapData.shoppingLinks || []));

  return {
    ...mapData,
    ...sup,
    imageUrl,
    fallbackImage,
    image: imageUrl, // for backward compatibility
    shoppingLinks,
    buyLinks: shoppingLinks // for backward compatibility
  };
}
