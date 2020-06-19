const User = require('../models').User;
const Project = require('../models').Project;
const Update = require('../models').Update;
const DB = require('../models');


const _dayDifference = (date1, date2) => {
    if (typeof date1 === 'string')  date1 = new Date(date1);
    if (typeof date2 === 'string')  date2 = new Date(date2);
    const timeDifference = date2.getTime() - date1.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    return dayDifference;
}

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
                order: [
                    ['createdAt', 'DESC']
                ],
                include: ['comments', 'likes', 'user', 'project']
            })
            return res.status(200).send(updates);
        }
        
        return res.status(200).send(projects);
    },

    async retrieveGrouped(req, res) {
        const projectId = req.params.project_id;
        const project = await Project.findByPk(projectId, { include: ['users'] });
        const page = req.query.page ? req.query.page : 1;
        const limit = req.query.limit ? req.query.limit : 5;

        if (project) {
            const cycle = project.cycle_type;
            const startDate = new Date(project.createdAt);
            const endDate = new Date();
            let totalDays = null;
            let pages = null;
            let rest = null;
            let pageStartDate = null;
            let pageEndDate = null;

            // TODO check permissions, also one update per day

            // TODO Pagination for daily updates
            if (cycle === 'daily') {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                totalDays = Math.ceil(_dayDifference(startDate, endDate));
                pages = Math.floor(totalDays / limit);
                rest = totalDays % limit;
                pages = rest > 0 ? pages+1 : pages;

                pageStartDate = new Date(startDate.getTime());
                pageStartDate.setDate(startDate.getDate() + (page - 1) * limit);
                pageEndDate = new Date(pageStartDate.getTime());
                pageEndDate.setDate(pageStartDate.getDate() + limit);
                pageEndDate.setHours(23, 59, 59, 999);
            } else {    // TODO Pagination for weekly updates

            }

            console.log('totalDays ', totalDays);
            console.log('Pages ', pages);
            console.log('Rest ', rest);
            console.log('pageStartDate ', pageStartDate);
            console.log('startDate ', startDate);
            console.log('pageEndDate ', pageEndDate);
            console.log('endDate ', endDate);


            const updates = await Update.findAll({
                where: {
                    project_id: projectId,

                    createdAt: {
                        [DB.Sequelize.Op.between]: [pageStartDate.toISOString(), pageEndDate.toISOString()]
                    }
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                include: ['comments', 'likes', 'user', 'project']
            })
            return res.status(200).send(updates);
        }
        
        return res.status(200).send(projects);
    },

    _groupUpdates(updates, from, to, cycle = 'daily') {
        let groupedUpdates = {};
        if (typeof from === 'string') { from = new Date(from); }
        if (typeof to === 'string') { to = new Date(to); }
        from.setHours(0,0,0,0);
        to.setHours(0,0,0,0);

         const insertGrouped = (update) => {
            const toInsertUpdateDate = new Date(update.date);
            toInsertUpdateDate.setHours(0,0,0,0);
            if (!groupedUpdates.hasOwnProperty(toInsertUpdateDate)) {
                groupedUpdates[toInsertUpdateDate] = [];
            }
            groupedUpdates[toInsertUpdateDate].push(update);
         }

        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            insertGrouped(update);
        }
    },

    async create(req, res) {
        const projectId = req.params.project_id;
        const data = req.body;

        project = await Project.findByPk(projectId);
            if (project) {
                const user = await User.findByPk(req.user.id);
                if (!data.title) data.title = user.name + ' has posted an update';
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
