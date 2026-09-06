const { Message, User } = require('../models');
const { Op } = require('sequelize');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.findAll({
      where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      include: [
        { association: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] },
        { association: 'receiver', attributes: ['id', 'firstName', 'lastName', 'avatar', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const conversationMap = new Map();
    messages.forEach((msg) => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          user: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.receiverId === userId) {
        conversationMap.get(otherId).unreadCount++;
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { otherId } = req.params;
    const userId = req.user.id;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: [
        { association: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { association: 'receiver', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    await Message.update({ isRead: true, readAt: new Date() }, {
      where: { senderId: otherId, receiverId: userId, isRead: false },
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const msg = await Message.create({ senderId: req.user.id, receiverId, content });
    const fullMsg = await Message.findByPk(msg.id, {
      include: [
        { association: 'sender', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { association: 'receiver', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
      ],
    });
    res.status(201).json(fullMsg);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
