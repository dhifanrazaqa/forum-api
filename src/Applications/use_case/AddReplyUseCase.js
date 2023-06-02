const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, useCaseParam, owner) {
    await this._commentRepository.isCommentBelongsThread(useCaseParam);
    const addReply = new AddReply({
      ...useCasePayload, ...useCaseParam, owner,
    });
    return this._replyRepository.addReply(addReply);
  }
}

module.exports = AddReplyUseCase;
