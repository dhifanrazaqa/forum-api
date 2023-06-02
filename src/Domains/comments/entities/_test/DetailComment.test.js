const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'budi',
      content: 'lorem ipsum dolor sit amet',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 12345,
      username: {},
      date: '2023',
      content: ['lorem ipsum dolor sit amet'],
      replies: 'oke',
      is_deleted: [],
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'budi',
      date: '2023',
      content: 'lorem ipsum dolor sit amet',
      replies: [],
      is_deleted: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.is_deleted).toEqual(payload.is_deleted);
  });
});
