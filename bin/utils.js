const fs = require("fs");
const path = require("path");

const parserToJson = (data) => {
    const dataList = data.split(/\r?\n/);
    const config = {};
    for (const index in dataList) {
        const [key, value] = dataList[index].split('=');
        config[key] = value;
    }
    return config;
}

const mapKeyValue = (keyMap, data) => {
    const mappedObj = {};
    Object.keys(keyMap).forEach(key => {
        mappedObj[keyMap[key].a] = data[keyMap[key].a] || data[keyMap[key].p]
    })
    return mappedObj;
}

const readFile = (filePath) => parserToJson(fs.readFileSync(filePath, 'utf-8').toString());

const loadConfigFile = (keyMap) => {
    let parsedDefVal = {};
    let defPath = null
    // checking for config.conf file
    try {
        const filePath = path.resolve(__dirname, '..', 'config.conf')
        parsedDefVal = readFile(filePath);
        defPath = filePath;
    } catch (error) {
        // console.error(error)
    }

    // checking for config.json file
    try {
        const filePath = path.resolve(__dirname, '..', 'config.json')
        parsedDefVal = require(filePath);
        defPath = filePath;
    } catch (error) {
        // console.error(error)
    }

    return {
        defPath, defaultValues: mapKeyValue(keyMap, parsedDefVal)
    }
}

const loadServiceFile = (config_file) => {
    // check for config_file
    let configfileData = {}
    if (config_file) {
        try {
            const defPath = path.resolve(config_file)
            const parsedDefVal = readFile(defPath);
            configfileData = mapKeyValue(keyMap, parsedDefVal)
        } catch (error) {
            // console.error(error)
        }
    }
    return configfileData;
}
module.exports = { parserToJson, mapKeyValue, readFile, loadConfigFile, loadServiceFile };