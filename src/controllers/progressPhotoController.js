const { ProgressPhoto, User } = require('../models');
const { cloudinary } = require('../middleware/upload');

exports.getMyPhotos = async (req, res) => {
  try {
    const photos = await ProgressPhoto.findAll({
      where: { userId: req.user.id },
      order: [['takenAt', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getClientPhotos = async (req, res) => {
  try {
    const photos = await ProgressPhoto.findAll({
      where: { userId: req.params.clientId },
      order: [['takenAt', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image fournie' });
    const { takenAt, notes, pose } = req.body;
    const photo = await ProgressPhoto.create({
      userId: req.user.id,
      url: req.file.path,
      publicId: req.file.filename,
      takenAt: takenAt || new Date().toISOString().split('T')[0],
      notes,
      pose,
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await ProgressPhoto.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo introuvable' });
    if (photo.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId).catch(() => {});
    }
    await photo.destroy();
    res.json({ message: 'Photo supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
