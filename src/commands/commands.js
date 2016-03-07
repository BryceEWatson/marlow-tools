var clui = require('clui');
var colors = require('colors/safe');
var config = require('../util/config.js');
var exec = require('child_process').exec;
var log = require('color-log');
var process = require('process');

Spinner = clui.Spinner;
var spinner = new Spinner('');

function onExecOut(data){
  spinner.stop(); //erases spinner
  process.stdout.write(colors.cyan(data));
  spinner.start();
}

function onExecErr(data){
  spinner.stop();
  process.stdout.write(colors.green(data));
  spinner.start();
}

module.exports = {
    cd: function(path) {
        return 'cd ' + path;
    },
    mkdir: function(path) {
        return 'mkdir ' + path;
    },
    rmDir: function(path) {
        return 'rm -rf ' + path;
    },
    gitClone: function(projectName, dest) {
        var cmd = 'git clone ' + config.repoRoot + projectName;
        if(dest) {
            cmd += ' ' + dest;
        }
        return cmd;
    },
    cloneAndInstall: function(options) {
        var projectName = options.generate;
        var destination = options.destination || projectName;
        return this.rmDir(config.tmpDir) + '; '
            + this.gitClone(projectName, config.tmpDir) + ' && '
            + this.mkdir(destination) + ' && '
            + this.cd(config.tmpDir) + ' && '
            + this.archiveAndUnpack('../' + destination) + ' && '
            + this.cd('../' + destination) + ' && '
            + this.npmInstall + ' && '
            + this.rmDir('../' + config.tmpDir);
    },
    archiveAndUnpack: function(outputDir) {
        return 'git archive master | tar -x -C ' + outputDir;
    },
    execute: function(command, callback) {
        log.info('executing: ' + command);
        var execute = exec(command);
        spinner.start();
        execute.stdout.on('data', onExecOut);
        execute.stderr.on('data', onExecErr);
        execute.on('exit', function onExecExit(code){
          spinner.stop();
          switch(code){
            case 0:
              if(callback) {
                  callback({code:code, success:true});
              }
              break;
            default:
              log.error('ERROR code:'+code, config.failed);
              if(callback) {
                  callback({code:code, success:false});
              }
              exit(1);
          }
        });
    },
    npmInstall: 'npm install',
    npmStart: 'npm start'
};
