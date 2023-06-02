const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const credentialId = 'user-123';

    const expectedDeletedComment = {
      id: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.isCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParam, credentialId);

    // Assert
    expect(mockCommentRepository.isCommentExist).toBeCalledWith({
      threadId: useCaseParam.threadId, commentId: useCaseParam.commentId,
    });
    expect(mockCommentRepository.verifyCommentAccess).toBeCalledWith({
      ownerId: credentialId, commentId: useCaseParam.commentId,
    });
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(expectedDeletedComment.id);
  });
});
