const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

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
      text: `SELECT comments.id, comments.content
              FROM comments 
              INNER JOIN threads ON comments.thread_id = threads.id
              WHERE comments.thread_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = CommentRepositoryPostgres;