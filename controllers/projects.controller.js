const User = require('../models').User;
const Project = require('../models').Project;
const ProjectUsers = require('../models').ProjectUsers;

module.exports = {
    async retrieve(req, res) {
        const owned = req.query.owned && req.query.owned === 'true' ? true : false;
        let projects = [];
        if (owned) {
            projects = await Project.findAll({
                where: {
                    owner_id: req.user.id
                },
                include: [
                    'owner', 'users'
                ]
            });
        } else {
            const user = await User.findByPk(req.user.id, {
                include: [{
                    model: Project,
                    as: 'projects',
                    include: ['owner', 'users']
                }]
            });
            projects = user.projects;
        }

        return res.status(200).send(projects);
    },

    async find(req, res) {
        const project = await Project.findByPk(req.params.project_id);
        if (project) {
            return res.status(200).send(project);
        } else {
            return res.status(500).send({ error: 'Could not retrieve project' });
        }
    },

    async create(req, res) {
        let project;
        let data = req.body;
        data.owner_id = req.user.id;

        try {
            project = await Project.create(data);
        } catch (e) {
            return res.status(500).send(e);
        }

        return res.status(201).send(project);
    },

    async update(req, res) {
        let project;
        let data = req.body;
        const project_id = req.params.project_id;
        data.owner_id = req.user.id;
        delete data.id;

        try {
            project = await Project.update(data, {
                where: {
                    owner_id: req.user.id,
                    id: project_id,
                }
            });
        } catch (e) {
            return res.status(500).send(e);
        }

        return res.status(200).send(project);
    },

    async addUser(req, res) {
        let project = await Project.findByPk(req.params.project_id);
        let user = await User.findOne({
            where: {
                email: req.params.email
            }
        });

        if (user && project) {
            if (project.owner_id != req.user.id) {
                return res.status(401).send({ error: 'forbidden' });
            }
            await ProjectUsers.create({
                user_id: user.id,
                project_id: project.id
            });

            return res.status(201).send(project);
        }

        return res.status(500).send({ error: 'error adding user' });
    },

    async deleteUser(req, res) {
        let project = await Project.findByPk(req.params.project_id);
        let user = await User.findByPk(req.params.user_id);

        if (project && user) {
            if (project.owner_id != req.user.id) {
                return res.status(401).send({ error: 'forbidden' });
            }
            
            await ProjectUsers.destroy({
                where: {
                    project_id: project.id,
                    user_id: user.id,
                }
            });
            return res.status(200).send(null);
        }
        return res.status(500).send({ error: 'error deleting user' });
    }
}
