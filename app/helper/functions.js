var exec = require('child_process').exec;
import fs from 'fs'

export const execshell = (command,callback) => {
  exec(command,(error,stdout,stderr) => {
    log.info("I am here",stderr,stdout)
    callback(error,stdout);
  });
}
