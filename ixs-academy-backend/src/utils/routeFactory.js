const express = require('express');
const createCrudController = require('./crudFactory');
const { protect } = require('../middleware/auth');

/**
 * Builds a fully-wired Express router for a content master:
 *   GET    /            public   - list (supports ?search=)
 *   GET    /:id         public   - single record
 *   POST   /             admin   - create
 *   PUT    /:id          admin   - update
 *   DELETE /:id          admin   - delete
 *
 * Reads are public because the website's own pages need to fetch this
 * content without logging in; writes require a valid admin JWT.
 */
function createCrudRouter(prisma, modelName, options = {}) {
  const router = express.Router();
  const controller = createCrudController(prisma, modelName, options);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getOne);
  router.post('/', protect, controller.create);
  router.put('/:id', protect, controller.update);
  router.delete('/:id', protect, controller.remove);

  return router;
}

module.exports = createCrudRouter;
