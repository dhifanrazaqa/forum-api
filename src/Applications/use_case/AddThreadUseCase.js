const AddThread = require("../../Domains/threads/entities/AddThread");

class AddThreadUseCase {
  constructor({threadRepository, authenticationTokenManager}) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, accessToken) {
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    const addThread = new AddThread({ ...useCasePayload, owner });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;