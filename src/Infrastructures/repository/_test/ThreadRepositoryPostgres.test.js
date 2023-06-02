const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'Lorem ipsum',
        body: 'lorem ipsum dolor amet',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');

      // Assert
      expect(thread).toHaveLength(1);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Lorem ipsum',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const Thread = {
        id: 'thread-123',
        title: 'lorem ipsum',
        body: 'dolor sit amet',
        date: '2023',
        owner: 'user-123',
      };
      const expectedThread = {
        id: 'thread-123',
        title: 'lorem ipsum',
        body: 'dolor sit amet',
        date: '2023',
        username: 'budi',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'budi' });
      await ThreadsTableTestHelper.addThread(Thread);

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(getThread).toStrictEqual(expectedThread);
    });
  });

  describe('isThreadExist', () => {
    it('should resolve when thread exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.isThreadExist('thread-123'))
        .resolves
        .toBeUndefined();
    });

    it('should throw NotFoundError when comment not exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.isThreadExist({
        threadId: 'thread-345',
      }))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
