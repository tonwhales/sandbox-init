import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import process from 'process';
import fs from 'fs';
import ipParse from 'ip-parse';
import { createDHTConfig } from './src/createDHTConfig';
import { createDHTPublic } from './src/createDHTPublic';

const DHT_IP = ['65.21.204.109', '65.21.194.243'];
const DHT_MAX_REPLICATION = 10; // Max = 10
const DHT_MAX_REQUESTS_PER_SECOND = 10; // Max = 10

function intToIp(src: number) {
    let b = Buffer.alloc(4);
    b.writeInt32BE(src, 0);
    return b[0].toString() + '.' + b[1].toString() + '.' + b[2].toString() + '.' + b[3].toString();
}

function ipToInt(src: string) {
    let ips = ipParse.parseIp(src);
    let b = Buffer.alloc(4);
    b[0] = parseInt(ips[0], 10);
    b[1] = parseInt(ips[1], 10);
    b[2] = parseInt(ips[2], 10);
    b[3] = parseInt(ips[3], 10);
    return b.readInt32BE(0);
}

(async () => {

    // Create directory
    rimraf.sync(__dirname + '/dht');
    await mkdirp(__dirname + '/dht');
    process.chdir(__dirname + '/dht/');

    // Network config
    let networkConfig: any[] = [];

    // Generate configuration
    let i = 0;
    for (let dht of DHT_IP) {
        const configDir = __dirname + '/dht/dht-' + (i + 1);
        const port = 2000 + Math.floor(Math.random() * (65000 - 2000));
        const ip = ipToInt(dht);

        // Crete keys
        rimraf.sync(configDir);
        await mkdirp(configDir);
        await mkdirp(configDir + '/keys');
        await mkdirp(configDir + '/keyring');
        process.chdir(configDir + '/keys');

        // Generate Keys
        let output = execSync('/usr/bin/ton/utils/generate-random-id -m keys -n dht').toString().trim().split(' ');
        if (output.length !== 2) {
            throw Error('Invalid output');
        }
        let id = output[0];
        let idBase = output[1];
        console.log(id + ' <-> ' + idBase);

        // Copy to keyring
        fs.copyFileSync(configDir + '/keys/dht', configDir + '/keyring/' + id);

        // Write config
        fs.writeFileSync(configDir + '/config.json', JSON.stringify(createDHTConfig(ip, port, idBase), null, 4));

        // Generate DHT signature
        let signature = execSync(`/usr/bin/ton/utils/generate-random-id -m dht -k '${configDir + '/keyring/' + id}' -a '${JSON.stringify(createDHTPublic(ip, port))}'`).toString();
        let publicSignedConfig = JSON.parse(signature);
        networkConfig.push(publicSignedConfig)

        process.chdir(__dirname + '/dht');
        i++;
    }

    // Load zerostates
    const zerostate_fhash = fs.readFileSync(__dirname + '/zerostate/zerostate.fhash').toString('base64');
    const zerostate_rhash = fs.readFileSync(__dirname + '/zerostate/zerostate.rhash').toString('base64');

    // Generate network config
    let config = JSON.stringify({
        "@type": "config.global",
        "dht": {
            "@type": "dht.config.global",
            "k": DHT_MAX_REPLICATION,
            "a": DHT_MAX_REQUESTS_PER_SECOND,
            "static_nodes": {
                "@type": "dht.nodes",
                "nodes": networkConfig
            }
        },
        "validator": {
            "@type": "validator.config.global",
            "zero_state": {
                "workchain": -1,
                "shard": '-9223372036854775808',
                "seqno": 0,
                "root_hash": zerostate_rhash,
                "file_hash": zerostate_fhash
            },
            "init_block": {
                "workchain": -1,
                "shard": '-9223372036854775808',
                "seqno": 0,
                "root_hash": zerostate_rhash,
                "file_hash": zerostate_fhash
            }
        }
    }, null, 4);

    // Patch
    config = config
        .replace('"-9223372036854775808"', `-9223372036854775808`)
        .replace('"-9223372036854775808"', `-9223372036854775808`)

    // Write configs
    fs.writeFileSync(__dirname + '/dht/config.net.json', config);
    for (let j = 0; j < i; j++) {
        fs.writeFileSync(__dirname + '/dht/dht-' + (j + 1) + '/config.net.json', config);
    }
})();