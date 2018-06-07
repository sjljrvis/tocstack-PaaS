import Github from '../classes/github'

export const initGithubOauth = async (req,res) => {
  let { code,state } = req.body;
  let github = new Github();
  try {

    let token = await github.getAccessToken(code,state);
    let userInfo = await github.getUserInfo(token.access_token);
    let user = {
      accessToken: token.access_token,
      id: userInfo.id,
      login: userInfo.login,
      nodeId: userInfo.node_id,
      url: userInfo.url,
      avatarUrl: userInfo.avatar_url
    }
    let repositories = await (github.getRepositories(user.login))
    res.status(200).json({ status: true,data: { token,user,repositories } });

    // Adding userData to DB asyncronously
    req.app.db.models.User.findOneAndUpdate({ "_id": req.JWTData.id },{ github: user },{ new: true },(err,_user) => {
      if (err) { log.error(err) }
      else {
        log.info(`${req.JWTData.id} has been update with github auth`)
      }
    })
  } catch (e) {
    console.log(e)
    res.status(400).json({ data: e,user: null });
  }
}

export const getUserInfo = async (req,res) => {
  try {
    let github = new Github();
    let userData = await req.app.db.models.User.findOne({ _id: req.JWTData.id });
    let userInfo = await github.getUserInfo(userData.github.accessToken);
    let user = {
      id: userInfo.id,
      login: userInfo.login,
      nodeId: userInfo.node_id,
      url: userInfo.url,
      avatarUrl: userInfo.avatar_url
    }
    res.status(200).json({ status: true,data: { user } });
  } catch (e) {
    console.log(e)
    res.status(200).json({ status: false,error: e.message });
  }
}


export const getRepositories = async (req,res) => {
  try {
    let github = new Github();
    let repositories = await (github.getRepositories(req.query.userName))
    res.status(200).json({ status: true,data: { repositories } });
  } catch (e) {
    res.status(200).json({ status: false,error: e.message });
  }
}