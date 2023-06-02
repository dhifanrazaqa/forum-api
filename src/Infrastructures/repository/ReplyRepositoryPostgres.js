const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, commentId, owner } = addReply;
    const id = `reply-${this._idGenerator(10)}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async isReplyExist({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT 1
              FROM replies 
              INNER JOIN comments ON replies.comment_id = comments.id
              WHERE replies.id = $1
              AND replies.comment_id = $2 
              AND replies.is_deleted = false
              AND comments.thread_id = $3`,
      values: [replyId, commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyAccess({ ownerId, replyId }) {
    const query = {
      text: `SELECT 1
              FROM replies 
              WHERE owner = $1 AND id = $2`,
      values: [ownerId, replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('anda tidak memiliki akses');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: `UPDATE replies
              SET is_deleted = true
              WHERE id = $1
              RETURNING id`,
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT 
              replies.id,
              replies.content,
              replies.date,
              users.username,
              replies.comment_id,
              replies.is_deleted
              FROM replies
              INNER JOIN comments ON replies.comment_id = comments.id
              INNER JOIN users ON replies.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY replies.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows.map((entry) => new DetailReply({ ...entry }));
  }
}

module.exports = ReplyRepositoryPostgres;
