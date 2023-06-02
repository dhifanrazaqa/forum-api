const AddedThread = require('../AddedThread');

describe('a AddedThread Entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Lorem ipsum',
      owner: 'user-123',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 2023,
      title: {},
      owner: 'abc',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Lorem ipsum',
      owner: 'user-123',
    };

    // Action
    const addThread = new AddedThread(payload);

    // Assert
    expect(addThread.id).toEqual(payload.id);
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.owner).toEqual(payload.owner);
  });
});
