const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const headerAuthorization = this.getToken(request.headers.authorization);

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(
      request.payload, request.params, headerAuthorization
    );
    
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  getToken(header) {
    if (!header) {
      throw new AuthenticationError('Missing authentication');
    }
    const token = header.split(" ")[1];
    return token;
  }
}

module.exports = CommentsHandler;
