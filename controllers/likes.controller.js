const User = require('../models').User;
const Like = require('../models').Like;
const Update = require('../models').Update;

module.exports = {
    async retrieve(req, res) {
        const likeId = req.params.like_id;
        const like = await Like.findByPk(likeId, { include: ['users'] });

        if (like) {
            // TODO check permissions, also one update per day
            const updates = await Update.findAll({
                where: {
                    like_id: likeId
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                include: ['comments', 'likes', 'user', 'like']
            })
            return res.status(200).send(updates);
        }
        
        return res.status(200).send(likes);
    },

    async create(req, res) {
        const likeId = req.params.like_id;
        const data = req.body;

        like = await Like.findByPk(likeId);
            if (like) {
                const user = await User.findByPk(req.user.id);
                if (!data.title) data.title = user.name + ' has posted an update';
                console.log('D ', data);
                const update = await Update.create({
                    user_id: req.user.id,
                    like_id: likeId,
                    title: data.title,
                    content: data.content,
                });
                return res.status(201).send(update);
            } else {
                return res.status(404).send({ error: 'Like not found' });
            }
    },

    async update(req, res) {
        const likeId = req.params.like_id;
        const data = req.body;

        try {
            like = await Like.findByPk(likeId);
            if (like) {
                const update = await Update.update({
                    title: data.title,
                    content: data.content,
                }, { where: { like_id: likeId } });
                return res.status(200).send(update);
            } else {
                return res.status(404).send({ error: 'Like not found' });
            }
        } catch (e) {
            return res.status(500).send({ error: e });
        }
    },

    async delete(req, res) {
        const user = await User.findByPk(req.user.id);
        const update = await Update.findByPk(req.params.update_id);

        if (update && user) {
            if (update.user_id != req.user.id) {
                return res.status(401).send({ error: 'Forbidden' });
            }
            
            await Update.destroy({
                where: {
                    id: req.params.update_id,
                }
            });
            return res.status(200).send(null);
        }
        return res.status(500).send({ error: 'Error deleting update' });
    }
}
