var exec = require('child_process').exec;

module.exports.monitorContainer = (req, res) => {
  let containerName = req.query.containerName;
  execute('docker inspect ' + req.query.containerName, (result) => {
    result = JSON.parse(result);
    if (result.length > 0) {
      res.status(200).json(result);
    }
    else {
      let _result = [{
        State: { Pid: 0 },
        HostConfig: { ShmSize: 0 },
        NetworkSettings: { IPAddress: 0, MacAddress: 0 }
      }
      ]
      res.status(200).json(_result);
    }
  })
}

module.exports.executeCommand = (req, res) => {
  let containerName = req.query.containerName;
  let command = req.body.command
  execute('docker run ' + req.query.containerName + " " + command, (result) => {
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