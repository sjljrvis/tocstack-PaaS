var exec = require('child_process').exec;

module.exports.monitorContainer = (req, res) => {
  let containerName = req.query.containerName;
  execute('docker inspect sejal_testingapp_stunning-wing', (result) => {
    result = JSON.parse(result);
    res.json(result);
  })

}

module.exports.viewGitCommits = (req, res) => {

}
module.exports.fetchLogs = (req, res) => {
  execute('docker logs sejal_testingapp_stunning-wing', (result) => {
    res.send(result);
  })
}
var execute = (command, callback) => {
  exec(command, (error, stdout, stderr) => {
    callback(stdout);
  });
};