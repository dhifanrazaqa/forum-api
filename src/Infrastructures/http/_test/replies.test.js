const pool = require('../../database/postgres/pool');

const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum dolor amet',
      };
      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it('should response 401 when no access token is provided', async () => {
      // arrange
      const requestPayload = {
        content: 'lorem ipsum dolor amet',
      };

      const server = await createServer(container);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      await ThreadTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentTableTestHelper.addComment({
        id: requestParams.commentId, threadId: requestParams.threadId, owner: userId,
      });
      await ReplyTableTestHelper.addReply({
        id: requestParams.replyId, commentId: requestParams.commentId, owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when not reply owner', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      const server = await createServer(container);

      const { userId: userId1 } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });
      const { accessToken: accessToken2 } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'andi' });

      await ThreadTableTestHelper.addThread({ id: requestParams.threadId, owner: userId1 });
      await CommentTableTestHelper.addComment({
        id: requestParams.commentId, threadId: requestParams.threadId, owner: userId1,
      });
      await ReplyTableTestHelper.addReply({
        id: requestParams.replyId, commentId: requestParams.commentId, owner: userId1,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      await ThreadTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });
      await CommentTableTestHelper.addComment({
        id: requestParams.commentId, threadId: requestParams.threadId, owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}/replies/${requestParams.replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
