const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, threadId, owner } = addComment;
    const id = `comment-${this._idGenerator(10)}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentByThreadId(id) {
    const query = {
      text: `SELECT 
              comments.id, 
              users.username, 
              comments.date, 
              comments.content,
              comments.is_deleted
              FROM comments 
              INNER JOIN users ON comments.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY comments.date ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map((entry) => new DetailComment({ ...entry, replies: [] }));
  }

  async isCommentExist({ threadId, commentId }) {
    const query = {
      text: `SELECT 1
              FROM comments 
              INNER JOIN threads ON comments.thread_id = threads.id
              WHERE comments.thread_id = $1 AND comments.id = $2 AND comments.is_deleted = false`,
      values: [threadId, commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentAccess({ ownerId, commentId }) {
    const query = {
      text: `SELECT 1
              FROM comments 
              WHERE owner = $1 AND id = $2`,
      values: [ownerId, commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('anda tidak memiliki akses');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: `UPDATE comments
              SET is_deleted = true
              WHERE id = $1
              RETURNING id`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async isCommentBelongsThread({ threadId, commentId }) {
    const query = {
      text: `SELECT id FROM comments
              WHERE id = $1 AND thread_id = $2`,
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment bukan bagian dari thread');
    }
  }
}

module.exports = CommentRepositoryPostgres;
