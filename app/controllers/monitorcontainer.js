import { NGINX_DIRECTORY,NGINX_SITES_ENABLED,shellScriptPath } from "../../config";
import fs from "fs";
import { exec,spawn } from "child_process";
import { read } from "fs";
import portfinder from 'portfinder'

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


export const rebuildContainer = (req,res) => {
  let PORT;
  const { repositoryName,projectPath } = req.body
  portfinder.getPort((err,port) => {
    PORT = port;
    let nginx = ` server {
      listen 80; 
      server_name ${repositoryName}.tocstack.com;
      location / {
       # app1 reverse proxy follow
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass http://localhost:${PORT};
     }
    }`;

    console.log(`${projectPath}_docker`);
    const task = spawn("sh",[`updateContainer.sh`],{ cwd: `${projectPath}_docker`,env: { PORT: `${PORT}` } });

    task.stderr.on('data',(err) => {
      console.log(err.toString())
    })

    task.stdout.on('data',(data) => {
      console.log(data.toString('utf-8'))
    })

    task.on('exit',function () {
      console.log('App running on port :',PORT)
      console.log(`Checkout your app ${repositoryName}.tocstack.com:${PORT}`);
      // updateNginx(repositoryName,nginx,(err,data) => {
      //   if (err) {
      //     console.log(err)
      //   }
      //   else console.log(data)
      // })
    });

  });
}


/*
* Custom functions used by api on demand for deployment
*/

const updateNginx = (repositoryName,nginx,callback) => {
  try {
    fs.writeFile(`${NGINX_DIRECTORY}/${repositoryName}.tocstack.com`,nginx,(err,data) => {
      if (err) throw new Error("Error while creating nginx config");
      else {
        exec(`ln -s ${NGINX_DIRECTORY}/${repositoryName}.tocstack.com ${NGINX_SITES_ENABLED}/${repositoryName}.tocstack.com && sudo service nginx reload`,(err,stderr,stdout) => {
          if (err) throw new Error("Error while linking nginx config");
          else {
            callback(null,"app deployed")
          }
        });
      }
    });
  }
  catch (e) {
    callback(e,"failed to deploy app")
  }
}



/*
* Custom functions used on runtime
*/
export const createNginx_API = (req,res) => {
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


export const updateNginx_API = (req,res) => {
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
