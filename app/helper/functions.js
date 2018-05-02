var exec = require('child_process').exec;

export const execshell = (command,callback) => {
  exec(command,(error,stdout,stderr) => {
    log.info("I am here",stderr,stdout)
    callback(error,stdout);
  });
}
