const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const pool = require('../../database/postgres/pool');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'budi' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

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
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Lorem ipsum',
        threadId: 'thread-123',
        owner: 'user-123',
      }));
      expect(comment).toBeDefined();
    });
  });

  describe('getCommentByThreadId', () => {
    it('should resolve when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByThreadId('thread-123'))
        .resolves;
    });

    it('should return comment correctly', async () => {
      // Arrange
      const Comment = {
        content: 'lorem ipsum',
        threadId: 'thread-123',
        date: '2023',
        owner: 'user-123',
      };
      const expectedComment = [
        new DetailComment({
          id: 'comment-123',
          username: 'budi',
          content: 'lorem ipsum',
          date: '2023',
          is_deleted: false,
          replies: [],
        }),
      ];

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment(Comment);

      // Action
      const getComment = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(getComment).toStrictEqual(expectedComment);
    });
  });

  describe('isCommentExist', () => {
    it('should resolve when comment exist', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
      }))
        .resolves
        .toBeUndefined();
    });

    it('should throw NotFoundError when comment not exist', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentExist({
        threadId: 'thread-123',
        commentId: 'comment-345',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        isDeleted: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentAccess', () => {
    it('should resolve when user have access', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        ownerId: 'user-123',
        commentId: 'comment-123',
      }))
        .resolves
        .toBeUndefined();
    });

    it('should throw AuthorizationError when user not have access', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        ownerId: 'user-999',
        commentId: 'comment-123',
      }))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById', () => {
    it('should delete comment properly by id', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      await expect(comment.is_deleted).toEqual(true);
    });

    it('should throw NotFoundError when comment doesnt exist', async () => {
      // Arrange
      const deleteCommentId = 'comment-999';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById(deleteCommentId))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('isCommentBelongsThread', () => {
    it('should resolve when comment belongs to thread', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentBelongsThread({
        threadId: 'thread-123',
        commentId: 'comment-123',
      }))
        .resolves;
    });

    it('should throw NotFoundError when comment not belongs to thread', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-999', owner: 'user-123' });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.isCommentBelongsThread({
        threadId: 'thread-999',
        commentId: 'comment-123',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
