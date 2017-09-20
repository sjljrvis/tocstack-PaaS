var exec = require('child_process').exec;

module.exports.monitorContainer = (req , res) =>{
   let containerName = req.query.containerName ;
   execute('docker inspect sejal_dockertest_mammoth-baseball' , (result) =>{
    result = JSON.parse(result);
    res.json(result);

   })

}

module.exports.viewGitCommits = (req , res) =>{

  }

var execute = (command, callback) => {
  exec(command, (error, stdout, stderr) => {

    console.log("Error", error);
    console.log("Std err", stderr);
    console.log("Stdout", stdout);

    callback(stdout);
  });
};