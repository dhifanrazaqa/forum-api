const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'budi' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'Lorem ipsum',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(comment).toHaveLength(1);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Lorem ipsum',
        threadId: 'thread-123',
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentByThreadId', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByThreadId('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return comment correctly', async () => {
      // Arrange
      const Comment = {
        content: 'lorem ipsum',
        threadId: 'thread-123',
        owner: 'user-123',
      };
      const expectedComment = {
        id: 'comment-123',
        content: 'lorem ipsum',
      };
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment(Comment);

      // Action
      const getComment = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(getComment).toStrictEqual(expectedComment);
    });
  });
});