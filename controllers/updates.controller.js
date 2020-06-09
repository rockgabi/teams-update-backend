const User = require('../models').User;
const Project = require('../models').Project;
const Update = require('../models').Update;

module.exports = {
    async retrieve(req, res) {
        const projectId = req.params.project_id;
        const project = await Project.findByPk(projectId, { include: ['users'] });

        if (project) {
            // TODO check permissions, also one update per day
            const updates = await Update.findAll({
                where: {
                    project_id: projectId
                },
                include: ['comments', 'likes', 'user', 'project']
            })
            return res.status(200).send(updates);
        }
        
        return res.status(200).send(projects);
    },

    async create(req, res) {
        const projectId = req.params.project_id;
        const data = req.body;

        try {
            project = await Project.findByPk(projectId);
            if (project) {
                const update = await Update.create({
                    user_id: req.user.id,
                    project_id: projectId,
                    title: data.title,
                    content: data.content,
                });
                return res.status(201).send(update);
            } else {
                return res.status(404).send({ error: 'Project not found' });
            }
        } catch (e) {
            return res.status(500).send({ error: e });
        }
    },

    async update(req, res) {
        const projectId = req.params.project_id;
        const data = req.body;

        try {
            project = await Project.findByPk(projectId);
            if (project) {
                const update = await Update.update({
                    title: data.title,
                    content: data.content,
                }, { where: { project_id: projectId } });
                return res.status(200).send(update);
            } else {
                return res.status(404).send({ error: 'Project not found' });
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
