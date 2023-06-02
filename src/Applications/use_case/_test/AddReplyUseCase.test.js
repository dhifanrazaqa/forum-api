const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Lorem ipsum',
    };

    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const credentialId = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: credentialId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockCommentRepository.isCommentBelongsThread = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload, useCaseParam, credentialId);
    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: credentialId,
    }));

    expect(mockCommentRepository.isCommentBelongsThread).toBeCalledWith({
      threadId: useCaseParam.threadId,
      commentId: useCaseParam.commentId,
    });

    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
      content: useCasePayload.content,
      commentId: useCaseParam.commentId,
      owner: credentialId,
    }));
  });
});
