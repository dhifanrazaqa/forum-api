const pool = require('../../database/postgres/pool');

const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/comment endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  describe('when POST /comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum dolor amet',
      };
      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      const threadId = 'thread-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 401 when no access token is provided', async () => {
      // arrange
      /* add comment payload */
      const requestPayload = {
        content: 'lorem ipsum dolor amet',
      };

      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
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
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      const threadId = 'thread-123';
      await ThreadTableTestHelper.addThread({ id: threadId, owner: userId });
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-123',
        commentId: 'comment-123',
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
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when not comment owner', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-234',
        commentId: 'comment-234',
      };

      const server = await createServer(container);

      const { userId: userId1 } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });
      const { accessToken: accessToken2 } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'andi' });

      await ThreadTableTestHelper.addThread({ id: requestParams.threadId, owner: userId1 });
      await CommentTableTestHelper.addComment({
        id: requestParams.commentId, threadId: requestParams.threadId, owner: userId1,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
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

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestParams = {
        threadId: 'thread-234',
        commentId: 'comment-234',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      await ThreadTableTestHelper.addThread({ id: requestParams.threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${requestParams.threadId}/comments/${requestParams.commentId}`,
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
