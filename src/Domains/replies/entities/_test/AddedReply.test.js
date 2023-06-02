const AddedReply = require('../AddedReply');

describe('a AddedReply Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'Lorem ipsum',
      owner: 'user-123',
    };

    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 2023,
      content: {},
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Lorem ipsum',
      owner: 'user-123',
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
