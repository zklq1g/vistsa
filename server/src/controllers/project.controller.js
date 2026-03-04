const projectRepository = require('../repositories/project.repository');
const { sendSuccess, sendError } = require('../utils/response.utils');

class ProjectController {
    async getProjects(req, res) {
        try {
            const { search, approvedOnly } = req.query;

            // Public visitors only see approved projects. 
            // Admins/Members might see all if specified, but usually we filter.
            const isApproved = approvedOnly === 'false' ? undefined : true;

            const projects = await projectRepository.findAll({ isApproved, search });
            return sendSuccess(res, projects, 'Projects fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const project = await projectRepository.findById(id);

            if (!project) return sendError(res, 'Project not found', 404);
            return sendSuccess(res, project, 'Project fetched successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async submitProject(req, res) {
        try {
            const { title, description, techStack, githubUrl, demoUrl, thumbnailUrl } = req.body;
            const userId = req.user.userId;

            if (!title || !description) {
                return sendError(res, 'Title and description are required', 400);
            }

            // If submitter is admin, auto-approve
            const isApproved = req.user.role === 'ADMIN';

            const project = await projectRepository.create({
                title,
                description,
                techStack: Array.isArray(techStack) ? techStack.join(', ') : techStack,
                githubUrl,
                demoUrl,
                thumbnailUrl,
                isApproved,
                submittedById: userId
            });

            return sendSuccess(res, project, 'Project submitted successfully', 201);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async updateProject(req, res) {
        try {
            const { id } = req.params;
            // Admin or submitter can edit. Role guard ensures only they get here (handled in routes/middleware).
            const updateData = { ...req.body };

            // Prevent non-admins from modifying approval or pin status
            if (req.user.role !== 'ADMIN') {
                delete updateData.isApproved;
                delete updateData.isPinned;
            }

            const project = await projectRepository.update(id, updateData);
            return sendSuccess(res, project, 'Project updated successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            await projectRepository.delete(id);
            return sendSuccess(res, null, 'Project deleted successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async approveProject(req, res) {
        try {
            const { id } = req.params;
            const project = await projectRepository.update(id, { isApproved: true });
            return sendSuccess(res, project, 'Project approved successfully');
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }

    async togglePin(req, res) {
        try {
            const { id } = req.params;
            const current = await projectRepository.findById(id);
            if (!current) return sendError(res, 'Project not found', 404);

            const project = await projectRepository.update(id, { isPinned: !current.isPinned });
            return sendSuccess(res, project, `Project ${project.isPinned ? 'pinned' : 'unpinned'} successfully`);
        } catch (error) {
            return sendError(res, error.message, 500);
        }
    }
}

module.exports = new ProjectController();
