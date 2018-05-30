import { NGINX_DIRECTORY,NGINX_SITES_ENABLED } from "../../config";
import fs from "fs";
import { exec } from "child_process";
import { read } from "fs";

export const monitorContainer = (req,res) => {
  let { containerName } = req.query;
  let containerDefault = `${containerName.split("_")[0]}_default`;

  exec(`docker inspect ${containerName}`,(err,stdout,stderr) => {
    let result = JSON.parse(stdout);
    if (result.length > 0) {
      let _result = [
        {
          State: result[0].State,
          HostConfig: { ShmSize: result[0].HostConfig.ShmSize },
          NetworkSettings: result[0].NetworkSettings.Networks
        }
      ];
      res.status(200).json({ status: true,info: _result })
    } else {
      let _result = [
        {
          State: { Pid: 0 },
          HostConfig: { ShmSize: 0 },
          NetworkSettings: { IPAddress: "0.0.0.0",MacAddress: "00:50:56:3F:FF:FF" }
        }
      ];
      res.status(200).json({ status: true,info: _result });
    }
  });
};

export const executeCommand = (req,res) => {
  const { containerName,command } = req.body;
  exec(`docker exec ${containerName} ${command}`,(err,stdout,stderr) => {
    res.status(200).send(stdout);
  });
};

export const fetchLogs = (req,res) => {
  const { app } = req.params;
  exec(`docker logs ${app} --timestamps`,(err,stdout,stderr) => { //docker_web_1
    res.status(200).json({ status: true,logs: stdout.split("\n") })
  });
};

export const reloadNginx = (req,res) => {
  exec("sudo service nginx reload",(err,stdout,stderr) => {
    res.send(stdout);
  });
};

export const createNginx = (req,res) => {
  let { repositoryName,nginx } = req.body;
  try {
    fs.writeFile(`${NGINX_DIRECTORY}/${repositoryName}.tocstack.com`,nginx,(err,data) => {
      if (err) throw new Error("Error while creating nginx config");
      else {
        exec(`ln -s ${NGINX_DIRECTORY}/${repositoryName}.tocstack.com ${NGINX_SITES_ENABLED}/${repositoryName}.tocstack.com && sudo service nginx reload`,(err,stderr,stdout) => {
          if (err) throw new Error("Error while linking nginx config");
          else {
            res.json({ status: true,message: "success" });
            req.app.db.models.Repository.findOneAndUpdate(
              { repositoryName: repositoryName },
              { isDeployed: true },
              (err,result) => { }
            );
          }
        });
      }
    });
  }
  catch (e) {
    return res.json({ status: false,message: e.message });
  }
};


export const updateNginx = (req,res) => {
  let { repositoryName,nginx } = req.body;
  fs.writeFile(`${NGINX_DIRECTORY}/${repositoryName}.tocstack.com`,nginx,(err) => {
    if (err) throw new Error("sudo service nginx reload")
    else {
      exec("sudo service nginx reload",(err,stdout,stderr) => {
        res.json({ status: true,message: "success" });
      });
    }
  });
};

export const pauseContainer = (req,res) => {
  let appName = req.params.app;
  exec(`docker pause ${appName}docker_web_1`,(err,stdout,stderr) => {
    res.send(stdout);
  });
};
