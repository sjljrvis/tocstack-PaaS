var exec = require('child_process').exec;

module.exports.monitorContainer = (req , res) =>{

   execute('docker inspect sejal_dockertest_mammoth-baseball' , (result) =>{
    result = JSON.parse(result);
    res.json(result);

   })

}

module.exports.viewGitCommits = (req , res) =>{

  
    //  execute('cd /home/sejal/Desktop/dockertest && git log' , (result) =>{
   
    //     console.log(result.split('commit'))
    //     res.json(result);
     
    //  })
  
  }

var execute = (command, callback) => {
  exec(command, (error, stdout, stderr) => {

    console.log("Error", error);
    console.log("Std err", stderr);
    console.log("Stdout", stdout);

    callback(stdout);
  });
};