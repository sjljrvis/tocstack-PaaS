var exec = require('child_process').exec;

export const execshell = (command, callback) => {
  exec(command, (error, stdout, stderr) => {
    console.log("I am here", stderr , stdout)
    callback(error,stdout);
  });
}
