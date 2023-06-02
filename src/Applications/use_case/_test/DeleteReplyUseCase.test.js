const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const credentialId = 'user-123';

    const expectedDeletedReply = {
      id: 'reply-123',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.isReplyExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParam, credentialId);
    // Assert
    expect(mockReplyRepository.isReplyExist).toBeCalledWith(useCaseParam);
    expect(mockReplyRepository.verifyReplyAccess).toBeCalledWith({
      ownerId: credentialId, replyId: useCaseParam.replyId,
    });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(expectedDeletedReply.id);
  });
});
