import axios from 'axios'

module.exports = function (token) {
  return (async () => {
    try {
      let options = {
        method: 'GET',
        baseURL: this.config.baseURL + '/users/sjljrvis/repos?access_token=' + token,
        headers: {
          Accept: "application/json"
        }
      }
      let { data } = await (axios(options))
      return data;
    } catch (e) {
      throw new Error(e)
    }
  })();
}