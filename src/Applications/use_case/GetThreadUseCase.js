class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam) {
    const { threadId } = useCaseParam;

    const detailThread = await this._threadRepository.getThreadById(threadId);
    let comments = await this._commentRepository.getCommentByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    comments = comments.map((comment) => {
      const tempContent = comment.content;
      delete comment.content;
      comment.replies = replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => {
          reply.content = reply.is_deleted ? '**balasan telah dihapus**' : reply.content;
          delete reply.comment_id;
          delete reply.is_deleted;
          return reply;
        });
      comment.content = comment.is_deleted ? '**komentar telah dihapus**' : tempContent;
      delete comment.is_deleted;
      return comment;
    });
    detailThread.comments = comments;

    return detailThread;
  }
}

module.exports = GetThreadUseCase;
