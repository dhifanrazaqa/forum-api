class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParam, owner) {
    const { threadId, commentId } = useCaseParam;
    await this._commentRepository.isCommentExist({ threadId, commentId });
    await this._commentRepository.verifyCommentAccess({ ownerId: owner, commentId });
    return this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
