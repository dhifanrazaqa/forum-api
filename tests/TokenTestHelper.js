/* istanbul ignore file */
const TokenTestHelper = {
  async getAccessTokenAndUserId({ server, username = 'budi' }) {
    const userPayload = {
      username, password: 'secret',
    };

    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'budi dicoding',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { id: userId } = (JSON.parse(response.payload)).data.addedUser;
    const { accessToken } = (JSON.parse(responseAuth.payload)).data;
    return { userId, accessToken };
  },
};

module.exports = TokenTestHelper;
