const _ = require('lodash')
const joi = require('@hapi/joi')
const router = new (require('koa-router'))()

const todoRepo = require('repo/todo')
const validate = require('middleware/validate')
const errorValidation = require('middleware/errorValidation')

router.post('/todo',
  validate.body({
    description: joi.string().trim().required(),
    priority: joi.number().integer().valid(1, 2, 3).required(),
    title: joi.string().trim().required(),
  }),
  errorValidation([{ error: 'todo.duplicate', status: 409 }]),
  async function (ctx) {
    await todoRepo.create(ctx.v.body)
    ctx.body = {}
  },
)

router.get('/todo',
  validate.query({
    limit: joi.number().positive().integer().default(10).optional(),
    orderBy: joi.string().trim().valid('id', 'title', 'priority').default('id').optional(),
    orderDirection: joi.string().trim().valid('ASC', 'DESC').default('ASC').optional(),
  }),
  async function (ctx) {
    ctx.body = await todoRepo.get(ctx.v.query)
  },
)

router.get('/todo/:id',
  validate.param({
    id: joi.number().integer().positive().required(),
  }),
  errorValidation([{ error: 'todo.not_found', status: 404 }]),
  async function (ctx) {
    ctx.body = await todoRepo.getById(ctx.v.param.id)
  },
)

router.put('/todo/:id',
  validate.param({
    id: joi.number().integer().positive().required(),
  }),
  validate.body({
    description: joi.string().trim().optional(),
    priority: joi.number().integer().valid(1, 2, 3).optional(),
    title: joi.string().trim().optional(),
  }),
  errorValidation([{ error: 'todo.duplicate', status: 409 }]),
  async function (ctx) {
    if (!_.isEmpty(ctx.v.body)) {
      await todoRepo.updateById(ctx.v.param.id, ctx.v.body)
    }
    ctx.body = {}
  },
)

router.patch('/todo/:id/is-done',
  validate.param({
    id: joi.number().integer().positive().required(),
  }),
  validate.body({
    isDone: joi.boolean().required(),
  }),
  async function (ctx) {
    await todoRepo.updateById(ctx.v.param.id, {
      is_done: ctx.v.body.isDone
    })
    ctx.body = {}
  }
)

module.exports = router
