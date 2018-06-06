
import fs from 'fs';
import { Oauthgrant } from '../../../config'

class Github {
  constructor() {
    this.config = {
      clientId: Oauthgrant.github.key,
      clientSecret: Oauthgrant.github.secret,
      redirectUri: Oauthgrant.github.redirect_uri,
      baseURL: 'https://api.github.com',
    }
  }
}

fs.readdirSync(__dirname + "/methods/").forEach((file) => {
  if (file != 'index.js') {
    let filename = file.replace('.js','')
    Github.prototype[filename] = require(__dirname + "/methods/" + filename)
  }
})



export default Github;