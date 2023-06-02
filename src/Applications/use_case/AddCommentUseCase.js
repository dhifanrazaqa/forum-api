const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, useCaseParam, owner) {
    await this._threadRepository.isThreadExist(useCaseParam.threadId);
    const addComment = new AddComment({
      ...useCasePayload, owner, threadId: useCaseParam.threadId,
    });
    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddCommentUseCase;
