import axios from 'axios'

/**
 * @param {*} userName
 * @returns {data} user/repository list
 */

module.exports = function (userName) {
  return (async () => {
    try {
      let options = {
        method: 'GET',
        baseURL: `${this.config.baseURL}/users/${userName}/repos?per_page=100`,
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