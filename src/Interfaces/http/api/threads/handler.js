const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AuthenticationError = require('../../../../Commons/exceptions/AuthenticationError');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const headerAuthorization = this.getToken(request.headers.authorization);

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload, headerAuthorization);
    
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
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

module.exports = ThreadsHandler;
