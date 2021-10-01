#!/usr/bin/env node
const amqp = require('amqplib');
const yargs = require("yargs");
const { loadServiceFile, loadConfigFile } = require("./utils");

const keyMap = {
    mqtt_client_id: { a: 'mqtt_client_id', p: 'C' },
    mqtt_port: { a: 'mqtt_port', p: 'p' },
    mqtt_host: { a: 'mqtt_host', p: 'h' },
    verbosity: { a: 'verbosity', p: 'v' },
    config_file: { a: 'config_file', p: 'c' },
}

const run = async () => {

    // checking for config file
    const { defaultValues, defPath } = loadConfigFile(keyMap)

    // parsing cmd args
    const cmdValues = yargs
        .option(keyMap.mqtt_client_id.p, {
            alias: keyMap.mqtt_client_id.a, describe: "client id", type: "string",
        })
        .option(keyMap.mqtt_port.p, {
            alias: keyMap.mqtt_port.a, describe: "port", type: "number",
        })
        .option(keyMap.mqtt_host.p, {
            alias: keyMap.mqtt_host.a, describe: "host name", type: "string",
        })
        .option(keyMap.verbosity.p, {
            alias: keyMap.verbosity.a, describe: "verbosity", type: "number",
        })
        .option(keyMap.config_file.p, {
            alias: keyMap.config_file.a, describe: "config file path", type: "string",
        }).argv;


    // check for config_file
    const configfileData = loadServiceFile(cmdValues.config_file) || {};

    const config = {
        mqtt_client_id: cmdValues.mqtt_client_id || configfileData.mqtt_client_id || defaultValues.mqtt_client_id,
        mqtt_port: +(cmdValues.mqtt_port || configfileData.mqtt_port || defaultValues.mqtt_port),
        mqtt_host: cmdValues.mqtt_host || configfileData.mqtt_host || defaultValues.mqtt_host,
        verbosity: +(cmdValues.verbosity || configfileData.verbosity || defaultValues.verbosity),
        config_file: cmdValues.config_file || defPath,
    }
    let timeout = false;
    try {
        const verbosityQueue = '/module/config/param/verbosity';
        const conn = await amqp.connect(`amqp://${config.mqtt_host}:${config.mqtt_port}`);
        const ch = await conn.createChannel();
        await ch.assertQueue(verbosityQueue, { durable: true });
        ch.consume(verbosityQueue, async (msg) => {
            try {
                const data = JSON.parse(msg.content)
                if (data.verbosity) config.verbosity = +data.verbosity;
                if (!timeout) {
                    timeout = true;
                    console.log(config)
                }
                ch.ack(msg);
                process.exit(0)
            } catch (error) {
                // console.error(`message: ${error.message}`);
            }
        });
        setTimeout(() => {
            if (!timeout) {
                timeout = true;
                console.log(config)
            }
        }, 5000);
    } catch (error) {
        // console.error(`message: ${error.message}`);
        if (!timeout) {
            timeout = true;
            console.log(config)
        }
        // console.error(error)
    }
}

run();
