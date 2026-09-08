const { Post, PostLike, PostComment, User, Notification, Follow } = require('../models');
const { Op } = require('sequelize');
const { cloudinary } = require('../middleware/upload');

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    const where = { isPublic: true };
    if (type) where.postType = type;

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { association: 'author', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] },
        { association: 'likes', attributes: ['userId'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Which authors does the current user follow?
    const myFollows = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId'],
    });
    const followingSet = new Set(myFollows.map(f => f.followingId));

    const posts = rows.map((post) => {
      const json = post.toJSON();
      return {
        ...json,
        isLiked: post.likes.some((l) => l.userId === req.user.id),
        author: json.author ? { ...json.author, isFollowing: followingSet.has(json.author.id) } : null,
      };
    });

    res.json({ posts, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, postType = 'general', isPublic = true } = req.body;
    let mediaUrl = null;
    let mediaType = 'none';

    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const post = await Post.create({ userId: req.user.id, content, postType, isPublic, mediaUrl, mediaType });
    const fullPost = await Post.findByPk(post.id, {
      include: [{ association: 'author', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] }],
    });
    res.status(201).json(fullPost);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    if (post.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Delete media from Cloudinary if present
    if (post.mediaUrl && post.mediaUrl.includes('cloudinary.com')) {
      const parts = post.mediaUrl.split('/');
      const uploadIdx = parts.indexOf('upload');
      if (uploadIdx !== -1) {
        const publicIdWithExt = parts.slice(uploadIdx + 2).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        const resourceType = post.mediaType === 'video' ? 'video' : 'image';
        cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {});
      }
    }

    await post.destroy();
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });

    const existing = await PostLike.findOne({ where: { postId: post.id, userId: req.user.id } });
    if (existing) {
      await existing.destroy();
      await post.decrement('likesCount');
      return res.json({ liked: false, likesCount: post.likesCount - 1 });
    }
    await PostLike.create({ postId: post.id, userId: req.user.id });
    await post.increment('likesCount');

    if (post.userId !== req.user.id) {
      await Notification.create({
        userId: post.userId,
        type: 'post_like',
        title: 'Nouveau j\'aime',
        body: `${req.user.firstName} a aimé votre publication`,
        data: { postId: post.id },
      });
    }
    res.json({ liked: true, likesCount: post.likesCount + 1 });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await PostComment.findAll({
      where: { postId: req.params.id },
      include: [{ association: 'author', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    const { content } = req.body;
    const comment = await PostComment.create({ postId: post.id, userId: req.user.id, content });
    await post.increment('commentsCount');

    const fullComment = await PostComment.findByPk(comment.id, {
      include: [{ association: 'author', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });

    if (post.userId !== req.user.id) {
      await Notification.create({
        userId: post.userId,
        type: 'post_comment',
        title: 'Nouveau commentaire',
        body: `${req.user.firstName} a commenté votre publication`,
        data: { postId: post.id },
      });
    }
    res.status(201).json(fullComment);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.viewPost = async (req, res) => {
  try {
    await Post.increment('viewCount', { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.playPost = async (req, res) => {
  try {
    await Post.increment('playCount', { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const comment = await PostComment.findOne({ where: { id: commentId, postId } });
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' });
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    await comment.destroy();
    await Post.decrement('commentsCount', { where: { id: postId } });
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
