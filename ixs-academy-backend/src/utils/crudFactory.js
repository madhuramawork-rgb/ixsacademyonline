const asyncHandler = require('./asyncHandler');

/**
 * Builds a standard set of REST handlers (list, get one, create, update,
 * delete) for a given Prisma model. Most of the site's content masters
 * (Banners, Faculty, Advisory, Testimonials, Partners, Podcasts, ...) are
 * simple "list of records with an order/status field" tables, so this one
 * factory covers all of them instead of hand-writing near-identical
 * controllers 12 times over.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} modelName   - the Prisma model name, e.g. "faculty"
 * @param {object} [options]
 * @param {object} [options.orderBy]      - default sort, e.g. { order: 'asc' }
 * @param {string[]} [options.searchFields] - text fields the `?search=` query matches against
 */
function createCrudController(prisma, modelName, options = {}) {
  const model = prisma[modelName];
  if (!model) {
    throw new Error(`crudFactory: no Prisma model named "${modelName}"`);
  }

  const { orderBy = { order: 'asc' }, searchFields = [] } = options;

  return {
    // GET /resource?search=...
    getAll: asyncHandler(async (req, res) => {
      const { search } = req.query;
      let where = {};

      if (search && searchFields.length) {
        where = {
          OR: searchFields.map((field) => ({
            [field]: { contains: search, mode: 'insensitive' },
          })),
        };
      }

      const items = await model.findMany({ where, orderBy });
      res.json({ success: true, count: items.length, data: items });
    }),

    // GET /resource/:id
    getOne: asyncHandler(async (req, res) => {
      const item = await model.findUnique({ where: { id: req.params.id } });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data: item });
    }),

    // POST /resource
    create: asyncHandler(async (req, res) => {
      const item = await model.create({ data: req.body });
      res.status(201).json({ success: true, data: item });
    }),

    // PUT /resource/:id
    update: asyncHandler(async (req, res) => {
      const item = await model.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ success: true, data: item });
    }),

    // DELETE /resource/:id
    remove: asyncHandler(async (req, res) => {
      await model.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Deleted' });
    }),
  };
}

module.exports = createCrudController;
