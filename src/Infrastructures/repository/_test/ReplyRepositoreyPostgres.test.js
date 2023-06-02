const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');

const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'budi' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'Lorem ipsum',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);
      const reply = await ReplyTableTestHelper.findReplyById('reply-123');

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'Lorem ipsum',
        threadId: 'thread-123',
        owner: 'user-123',
      }));
      expect(reply).toBeDefined();
    });
  });

  describe('isReplyExist', () => {
    it('should resolve when reply exist', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      }))
        .resolves
        .toBeUndefined();
    });

    it('should throw NotFoundError when reply not exist', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-345',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
        isDeleted: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyAccess', () => {
    it('should resolve when user have access', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        ownerId: 'user-123',
        replyId: 'reply-123',
      }))
        .resolves
        .toBeUndefined();
    });

    it('should throw AuthorizationError when user not have access', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        ownerId: 'user-999',
        replyId: 'reply-123',
      }))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById', () => {
    it('should delete reply properly by id', async () => {
      // Arrange
      await ReplyTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');
      const reply = await ReplyTableTestHelper.findReplyById('reply-123');

      // Assert
      await expect(reply.is_deleted).toEqual(true);
    });

    it('should throw NotFoundError when reply doesnt exist', async () => {
      // Arrange
      const deleteReplyId = 'reply-999';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.deleteReplyById(deleteReplyId))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('getRepliesByThreadId', () => {
    it('should resolve when replies not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.getRepliesByThreadId('thread-123'))
        .resolves;
    });

    it('should return all replies correctly', async () => {
      // Arrange
      const replyA = {
        id: 'reply-123', commentId: 'comment-123', content: 'Hello World', date: '2023',
      };
      const replyB = {
        id: 'reply-456', commentId: 'comment-123', content: 'halo dunia', date: '2025', isDeleted: true,
      };

      const expectedReplies = [
        new DetailReply({
          id: 'reply-123', comment_id: 'comment-123', content: 'Hello World', date: '2023', username: 'budi', is_deleted: false,
        }),
        new DetailReply({
          id: 'reply-456', comment_id: 'comment-123', content: 'halo dunia', date: '2025', username: 'budi', is_deleted: true,
        }),
      ];

      await ReplyTableTestHelper.addReply({ ...replyA, owner: 'user-123' });
      await ReplyTableTestHelper.addReply({ ...replyB, owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const getReplies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(getReplies).toStrictEqual(expectedReplies);
    });
  });
});
