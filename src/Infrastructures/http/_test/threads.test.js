const pool = require('../../database/postgres/pool');

const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');

const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const TokenTestHelper = require('../../../../tests/TokenTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/thread endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Lorem Ipsum',
        body: 'lorem ipsum dolor amet',
      };
      const server = await createServer(container);

      const { accessToken } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 401 when no access token is provided', async () => {
      // arrange
      /* add thread payload */
      const requestPayload = {
        title: 'Lorem Ipsum',
        body: 'lorem ipsum dolor amet',
      };

      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Lorem Ipsum',
      };
      const server = await createServer(container);

      const { accessToken } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Lorem Ipsum',
        body: true,
      };
      const server = await createServer(container);

      const { accessToken } = await TokenTestHelper.getAccessTokenAndUserId({ server, username: 'budi' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 with detail threads and comments', async () => {
      // Arrange
      const threadIdParams = 'thread-123';

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'budi' });
      await ThreadTableTestHelper.addThread({ id: threadIdParams, owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', threadId: threadIdParams, owner: 'user-123', date: '2023',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-456', threadId: threadIdParams, owner: 'user-123', date: '2023',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-789', threadId: threadIdParams, owner: 'user-123', date: '2023',
      });
      await ReplyTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-456', owner: 'user-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-456', commentId: 'comment-123', owner: 'user-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadIdParams}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.date).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
    });

    it('should response 404 when thread doesnt exist', async () => {
      // arrange
      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-999',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
