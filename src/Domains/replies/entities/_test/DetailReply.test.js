const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'lorem ipsum dolor sit amet',
      username: 'budi',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 12345,
      content: ['lorem ipsum dolor sit amet'],
      date: '2023',
      username: {},
      comment_id: {},
      is_deleted: 2023,
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'lorem ipsum dolor sit amet',
      date: '2023',
      username: 'budi',
      comment_id: 'comment-123',
      is_deleted: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.comment_id).toEqual(payload.comment_id);
    expect(detailReply.is_deleted).toEqual(payload.is_deleted);
  });
});
