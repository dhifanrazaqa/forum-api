/* eslint-disable camelcase */
class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, comment_id, is_deleted,
    } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.comment_id = comment_id;
    this.is_deleted = is_deleted;
  }

  _verifyPayload({
    id, content, date, username, comment_id, is_deleted,
  }) {
    if (!id || !username || !date || !content || !comment_id || is_deleted === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || typeof date !== 'string'
    || typeof content !== 'string'
    || typeof comment_id !== 'string'
    || typeof is_deleted !== 'boolean') {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
