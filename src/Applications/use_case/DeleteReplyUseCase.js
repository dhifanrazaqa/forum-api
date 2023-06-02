class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam, owner) {
    await this._replyRepository.isReplyExist(useCaseParam);
    await this._replyRepository.verifyReplyAccess({
      ownerId: owner, replyId: useCaseParam.replyId,
    });
    return this._replyRepository.deleteReplyById(useCaseParam.replyId);
  }
}

module.exports = DeleteReplyUseCase;
