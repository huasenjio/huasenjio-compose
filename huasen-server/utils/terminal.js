// 执行终端命令
const { exec, spawn } = require('child_process')
const { resolve } = require('path')

// npm install
const commandSpawn = (command, args, options) => {
    return new Promise((resolve, reject) => {
        // 'npm' ['install'] {cwd: '工作路径'}
        const childProcess = spawn(command, args, options)
        childProcess.stdout.pipe(process.stdout)
        childProcess.stdout.pipe(process.stderr)
        childProcess.on('close', () => {
            resolve();
        })
    })
}

module.exports = {
    commandSpawn
}