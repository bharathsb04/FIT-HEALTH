const db = require('../data/dbStorage');

exports.getSupplements = async (req, res) => {
  try {
    const supplements = db.getCollection('supplements');
    const { category, brand, search } = req.query;

    let filtered = [...supplements];
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      filtered = filtered.filter(s =>
        s.category && s.category.toLowerCase().includes(catLower)
      );
    }
    if (brand && brand !== 'all') {
      const brandLower = brand.toLowerCase();
      filtered = filtered.filter(s =>
        s.brand && s.brand.toLowerCase().includes(brandLower)
      );
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.brand && s.brand.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.purpose && s.purpose.toLowerCase().includes(q)) ||
        (s.tagline && s.tagline.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      safetyNotice: "Important: Dietary supplements are not intended to diagnose, treat, cure, or prevent any medical condition. Always review with a licensed healthcare practitioner before commencing new supplementation protocols.",
      supplements: filtered
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
