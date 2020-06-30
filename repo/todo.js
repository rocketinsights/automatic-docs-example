const _ = require('lodash')
const error = require('error')
const { db, helper } = require('db')

async function create ({ title, description, priority }) {
  const todo = await db.none(`
    INSERT INTO todo (title, description, priority)
    VALUES ($[title], $[description], $[priority])
  `, {
    title,
    description,
    priority,
  }).catch(err => {
    switch (err.constraint) {
      case 'todo_title_key':
        throw error('todo.duplicate', err)
      default:
        throw error.db(err)
    }
  })

  return todo
}

async function updateById (id, { title, description, priority, is_done }) {
  await db.none(helper.update(_.omitBy({
    description,
    priority,
    title,
    is_done,
  }, _.overSome([_.isUndefined, _.isNaN])), null, 'todo') + ' WHERE id = $[id]', { id })
  .catch(err => {
    switch (err.constraint) {
      case 'todo_title_key':
        throw error('todo.duplicate', err)
      default:
        throw error.db(err)
    }
  })
}

async function getById (id) {
  return db.one(`
    SELECT *
    FROM todo
    WHERE id = $1
  `, [id])
  .catch(error.db({ noData: 'todo.not_found' }))
}

async function get ({ limit, orderBy, orderDirection }) {
  const todos = await db.any(`
    SELECT * FROM todo
    ORDER BY $1:value $2:value
    LIMIT $3
  `, [
    orderBy,
    orderDirection,
    limit
  ]).catch(error.db)

  return todos
}

module.exports = {
  create,
  get,
  getById,
  updateById,
}
