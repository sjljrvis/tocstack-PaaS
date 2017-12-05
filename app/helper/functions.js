var exec = require('child_process').exec;

export const execshell = (command, callback) => {
  exec(command, (error, stdout, stderr) => {
    callback(error,stdout);
  });
}
