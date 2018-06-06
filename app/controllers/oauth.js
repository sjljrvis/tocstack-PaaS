import Github from '../classes/github'

export const initGithubOauth = async (req,res) => {
  let { code,state } = req.body;
  let github = new Github();
  try {

    let token = await github.getAccessToken(code,state)
    let userInfo = await github.getUserInfo(token.access_token);
    let user = {
      id: userInfo.id,
      login: userInfo.login,
      nodeId: userInfo.node_id,
      url: userInfo.url
    }
    res.status(200).json({ data: token,user: userInfo });
  } catch (e) {
    console.log(e)
    res.status(400).json({ data: e,user: null });
  }
}

export const saveUserInfo = async (req,res) => {
  let { token } = req.body;
  let github = new Github();
  let userInfo = await github.getUserInfo(token);
  let user = {
    id: userInfo.id,
    login: userInfo.login,
    nodeId: userInfo.node_id,
    url: userInfo.url
  }
  res.status(200).json({ data: user });
}