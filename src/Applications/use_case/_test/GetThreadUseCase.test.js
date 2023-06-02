const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

const GetThreadUseCase = require('../GetThreadUseCase');

const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const DetailComments = require('../../../Domains/comments/entities/DetailComment');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    // mock
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'lorem ipsum',
      body: 'lorem ipsum dolor sit amet',
      date: '2023',
      username: 'budi',
      comments: [],
    });

    const mockComments = [
      new DetailComments({
        id: 'comment-123',
        username: 'user A',
        date: '2023',
        content: 'Hello world',
        replies: [],
        is_deleted: true,
      }),
      new DetailComments({
        id: 'comment-456',
        username: 'user B',
        date: '2023',
        content: 'Halo dunia',
        replies: [],
        is_deleted: false,
      }),
    ];

    const mockReplies = [
      new DetailReply({
        id: 'reply-123',
        content: 'balasan satu',
        date: '2023',
        username: 'user C',
        comment_id: 'comment-123',
        is_deleted: false,
      }),
      new DetailReply({
        id: 'reply-456',
        content: 'balasan dua',
        date: '2023',
        username: 'user D',
        comment_id: 'comment-456',
        is_deleted: true,
      }),
    ];

    // expected
    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'lorem ipsum',
      body: 'lorem ipsum dolor sit amet',
      date: '2023',
      username: 'budi',
      comments: [],
    });

    const expectedCommentsAndReplies = [
      new DetailComments({
        content: '**komentar telah dihapus**',
        date: mockComments[0].date,
        id: mockComments[0].id,
        username: mockComments[0].username,
        replies: [mockReplies[0]],
        is_deleted: true,
      }),
      new DetailComments({
        content: mockComments[1].content,
        date: mockComments[1].date,
        id: mockComments[1].id,
        username: mockComments[1].username,
        replies: [mockReplies[1]],
        is_deleted: false,
      }),
    ];

    expectedCommentsAndReplies.map((comment) => {
      delete comment.is_deleted;
      return comment;
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThreadResult = await getDetailThreadUseCase.execute(useCaseParam);

    // Assert
    expect(detailThreadResult).toStrictEqual(new DetailThread({
      ...expectedDetailThread,
      comments: expectedCommentsAndReplies,
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);
  });
});
