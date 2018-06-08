import axios from 'axios'

/**
 *
 *
 * @param {*} code
 * @param {*} state
 * @returns {data} consists of user access_token and oauthD_data
 */

module.exports = function (code,state) {
  return (async () => {
    try {
      let options = {
        method: 'POST',
        url: 'https://github.com/login/oauth/access_token',
        headers: {
          Accept: "application/json"
        },
        data: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code,
          state: state || ""
        }
      }
      let { data } = await (axios(options))
      return data;
    } catch (e) {
      throw new Error(e)
    }
  })();
}
