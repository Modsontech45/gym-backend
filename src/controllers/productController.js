const { Product, Gym, User } = require('../models');

const getGym = async () => Gym.findOne({ where: { isDefault: true } });

exports.list = async (req, res) => {
  try {
    const gym = await getGym();
    if (!gym) return res.json([]);
    const products = await Product.findAll({
      where: { gymId: gym.id },
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const gym = await getGym();
    if (!gym) return res.status(404).json({ message: 'No default gym' });
    const { name, description, category, originalPrice, currentPrice, currency, inStock } = req.body;
    // image can come from file upload OR from body URL
    const image = req.file?.path || req.body.image || null;
    const product = await Product.create({
      gymId: gym.id,
      coachId: req.user.id,
      name, description, image, category,
      originalPrice, currentPrice,
      currency: currency || 'FCFA',
      inStock: inStock !== 'false' && inStock !== false,
    });
    const full = await Product.findByPk(product.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const updates = { ...req.body };
    if (req.file?.path) updates.image = req.file.path;
    // inStock comes as string from FormData
    if ('inStock' in updates) updates.inStock = updates.inStock !== 'false' && updates.inStock !== false;
    await product.update(updates);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
