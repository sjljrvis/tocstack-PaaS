var exec = require('child_process').exec;

module.exports.monitorContainer = (req, res) => {
  let containerName = req.query.containerName;
  execute('docker inspect '+req.query.containerName, (result) => {
    result = JSON.parse(result);
    res.status(200).json(result);
  })
}

module.exports.executeCommand = (req, res) => {
  let containerName = req.query.containerName;
  let command = req.body.command
  execute('docker run '+req.query.containerName+" "+command, (result) => {
    res.status(200).send(result);
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