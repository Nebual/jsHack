#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const _ = require('lodash')

function FileSystem () {
    this.nodes = {}
}

function Node () {
    this.files = {}
}

function File () {
    this.path = ''
    this.name = ''
    this.type = ''
    this.data = ''
}

//const reFileName = ''//

function newFile (srcPath, machinePath) {
    let file = new File()
    console.log(`old: ${srcPath}\nnew: ${srcPath.slice(machinePath.length, srcPath.length )}`)
    file.fileName = ''
    file.path = srcPath.slice(machinePath.length, srcPath.length )
    file.type = ''
    file.data = ''
    return file
}

const walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else results.push(file)
    })
    return results
}

program
    .version('0.0.1')
    .description('Tool to build fake virtual machines for jsHack')
    .option('-i, --input <path>', 'input directory')
    .option('-o, --output <path>', 'output directory')
    .parse(process.argv)

const srcPath = program.input || '../src/machines'

const fileSystem = new FileSystem()

//Add nodes to file system
const nodes = fs.readdirSync(srcPath)
nodes.map((node) => {
    const machine = new Node()
    const machinePath = `${srcPath}/${node}`
    //Add files to nodes
    const files = walk(machinePath)
    files.map((filePath) => {
        let file = newFile(filePath, machinePath)

        machine.files[file.path] = file
    })

    fileSystem.nodes[node] = machine
})

console.dir(JSON.stringify(fileSystem))