const AddComment = require('../AddComment');

describe('a AddComments entities', () => { 
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc'
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      threadId: true,
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Lorem ipsum dolor sit amet',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Action
    const addComment = new AddComment(payload);

    // Assert
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.threadId).toEqual(payload.threadId);
    expect(addComment.owner).toEqual(payload.owner);
  });
});