/* eslint-disable camelcase */
class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies, is_deleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
    this.is_deleted = is_deleted;
  }

  _verifyPayload({
    id, username, date, content, replies, is_deleted,
  }) {
    if (!id || !username || !date || !content || !replies || is_deleted === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || typeof date !== 'string'
    || typeof content !== 'string'
    || !(Array.isArray(replies))
    || typeof is_deleted !== 'boolean') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
