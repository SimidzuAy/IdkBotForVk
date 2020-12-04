const fs = require('fs')

function getDirFiles(path='', jss=[]) {
    path = path ? path : `${__dirname}/modules`
    const files = fs.readdirSync(path)

    files.forEach(file => {
        if ( fs.lstatSync(`${path}/${file}`).isDirectory() ) {
            getDirFiles(`${path}/${file}`, jss)
        } else if ( file.endsWith(".js") && !file.startsWith("ICommand") && !file.startsWith("types") ) {
            jss.push(`${path}/${file}`)
        }
    })

    return jss
}

module.exports = (hearManager, logger) => {
    getDirFiles().forEach(file => {
        const command = require(file).default
        logger.module(file
            .replace(`${__dirname}`, '')
            .replace(/\\/g, '/'))
        const a = new command()
        hearManager.hear(a.hears, a.handler)
    })
}
