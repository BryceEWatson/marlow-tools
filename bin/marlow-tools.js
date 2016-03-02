#!/usr/bin/env node

var cli = require('cli');
var exec = require('child_process').exec;

var express = require("express");
var app = module.exports = express();

var findPort = require('find-open-port');
var open = require('open');
var process = require('process');
var shelljs = require('shelljs/global');
var util = require('util');

var log = require('npmlog');
log.enableColor();

if(!which('git')){
  echo('This package requires git');
  exit(1);
}

var args = process.argv.slice(2);
var projectName = args[0];
var repoRoot = 'https://github.com/marko-js-samples/';
var success = 'Package installed successfully';
var usage = 'Usage: marko generate [projectName]';
var gitClone = 'git clone '+repoRoot+projectName+' && ';
var cd = 'cd '+projectName+' && ';
var npmInstall = 'npm install';
var installSuccess = 'Installation successful.';
var installFailed = 'Installation failed.';
var installFailed = 'Installation failed.';


if (!args.length){  //Open a web browser window.
  open('http://www.markojs.com');
  exit(1);
} else if(args.length > 1){ //Reject 2 or more arguments
  log.error('Too many arguments');
  log.info('',usage);
  exit(1);
} else { //Accept one argument
  var cmds = exec(gitClone + cd + npmInstall);
  cli.spinner('Generating...');
  cmds.stdout.on('data', function(data){
    log.info('',data);
  });
  cmds.stderr.on('data', function(data){
    log.info('',data);
  });
  cmds.on('exit', function(code){
    cli.spinner('Working.. done!', true);
    switch(code){
      case 0:
        log.info('OK', installSuccess);
        findPort().then(port => {
          process.chdir(projectName);
          app.listen(port);
          app.get('/', function (req, res) {
            res.send('Hello World!');
          });
          log.info('', 'Listening on port '+port);
          open('http://localhost:'+port);
        });
        break;
      default:
        log.error('ERROR code:'+code, installFailed);
        exit(1);
    }
  });
}
