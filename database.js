require('dotenv').config();

const { Pool } = require('pg');
const isProduction = process.env.NODE_ENV === 'production';

// const connectionString = `postgres://<user>:<password>@<host>:<port>/<database>?<query>`
const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction
});

const getTodos = (req, res) => {
  pool.query('SELECT * FROM todos ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const getTodoById = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('SELECT * FROM todos WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

const createTodo = (req, res) => {
  const { text } = req.body;

  pool.query(
    'INSERT INTO todos (text) VALUES ($1) RETURNING id',
    [text],
    (error, result) => {
      if (error) {
        throw error;
      }
      res.status(201).json({ id: result.rows[0].id });
    }
  );
};

const toggleTodo = (req, res) => {
  const completed = req.body.completed;
  const id = req.params.id;
  pool.query(
    'UPDATE todos SET completed = $1 WHERE id = $2',
    [completed, id],
    (error, result) => {
      if (error) {
        throw error;
      }
      res.status(201).json({
        message: `Successfully toggled complete status of todo with id ${id} to ${completed}`
      });
    }
  );
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  toggleTodo
};
