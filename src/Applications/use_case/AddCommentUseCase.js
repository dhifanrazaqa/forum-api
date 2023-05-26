const AddComment = require("../../Domains/comments/entities/AddComment");

class AddCommentUseCase {
  constructor({
    threadRepository, commentRepository, authenticationTokenManager
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseParam, accessToken) {
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._threadRepository.getThreadById(useCaseParam.threadId);
    const addComment = new AddComment({ 
      ...useCasePayload, owner, threadId: useCaseParam.threadId
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;