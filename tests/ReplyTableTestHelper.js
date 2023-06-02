/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ReplyTableTestHelper = {
  async addReply({
    id = 'reply-123', commentId = 'comment-123',
    owner = 'user-123', content = 'lorem ipsum dolor',
    isDeleted = false, date = '2023',
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, commentId, owner, isDeleted, date],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id=$1',
      values: [id],
    };
    await pool.query(query);
  },

};

module.exports = ReplyTableTestHelper;
