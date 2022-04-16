import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import fs from 'fs';
import ipParse from 'ip-parse';
import { createDHTConfig } from './nodes/createDHTConfig';
import { createDHTPublic } from './nodes/createDHTPublic';
import { Config } from './script-config';
import { createValidatorConfig } from './nodes/createValidatorConfig';

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
    await mkdirp(__dirname + '/gen/nodes');

    // Network config
    let networkConfig: any[] = [];
    let networkLiteServers: any[] = [];

    // Generate DHT
    let i = 0;
    for (let dht of Config.dht.endpoints) {
        const configDir = __dirname + '/gen/nodes/dht-' + (i + 1);
        const port = 2000 + Math.floor(Math.random() * (65000 - 2000));
        const ip = ipToInt(dht);

        // Crete keys
        await mkdirp(configDir + '/keyring');
        // process.chdir(configDir + '/keys');

        // Generate Keys

        let privateKey = fs.readFileSync(__dirname + '/gen/keys/dht-' + (i + 1));
        let id = fs.readFileSync(__dirname + '/gen/keys/dht-' + (i + 1) + '.id', 'utf-8');
        let idBase = fs.readFileSync(__dirname + '/gen/keys/dht-' + (i + 1) + '.uid', 'utf-8');

        // Write keyring
        fs.writeFileSync(configDir + '/keyring/' + id, privateKey);

        // Write config
        fs.writeFileSync(configDir + '/config.json', JSON.stringify(createDHTConfig(ip, port, idBase), null, 4));

        // Generate DHT signature
        let signature = execSync(`/usr/bin/ton/utils/generate-random-id -m dht -k '${configDir + '/keyring/' + id}' -a '${JSON.stringify(createDHTPublic(ip, port))}'`).toString();
        let publicSignedConfig = JSON.parse(signature);
        networkConfig.push(publicSignedConfig);
        i++;
    }

    // Generate Validators
    for (let i = 0; i < Config.validators.endpoints.length; i++) {
        const configDir = __dirname + '/gen/nodes/validator-' + (i + 1);
        const port = 2000 + Math.floor(Math.random() * (65000 - 2000));

        // Crete keys
        await mkdirp(configDir + '/keys');
        await mkdirp(configDir + '/db/keyring');
        await mkdirp(configDir + '/db/static');
        await mkdirp(configDir + '/db/import');

        // Copy states
        const basestateHash = fs.readFileSync(__dirname + '/gen/zerostate/basestate0.fhash').toString('hex').toUpperCase();
        const zerostateHash = fs.readFileSync(__dirname + '/gen/zerostate/zerostate.fhash').toString('hex').toUpperCase();
        fs.copyFileSync(__dirname + '/gen/zerostate/basestate0.boc', configDir + '/db/static/' + basestateHash);
        fs.copyFileSync(__dirname + '/gen/zerostate/basestate0.boc', configDir + '/db/import/' + basestateHash);
        fs.copyFileSync(__dirname + '/gen/zerostate/zerostate.boc', configDir + '/db/static/' + zerostateHash);
        fs.copyFileSync(__dirname + '/gen/zerostate/zerostate.boc', configDir + '/db/import/' + zerostateHash);

        // Write validator-specific keys
        for (let k of ['validator', 'adnl-dht', 'adnl-main', 'adnl-validator']) {
            let privateKey = fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-' + k);
            let id = fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-' + k + '.id', 'utf-8');
            fs.writeFileSync(configDir + '/db/keyring/' + id, privateKey);
        }

        // Write validator-global keys
        for (let k of ['validator-client', 'validator-server', 'lite-server']) {
            let privateKey = fs.readFileSync(__dirname + '/gen/keys/' + k);
            let id = fs.readFileSync(__dirname + '/gen/keys/' + k + '.id', 'utf-8');
            fs.writeFileSync(configDir + '/db/keyring/' + id, privateKey);
        }

        // Write keys for mytonctl
        fs.copyFileSync(__dirname + '/gen/keys/lite-server.pub', configDir + '/keys/liteserver.pub');
        fs.copyFileSync(__dirname + '/gen/keys/validator-client', configDir + '/keys/client');
        fs.copyFileSync(__dirname + '/gen/keys/validator-client.pub', configDir + '/keys/client.pub');
        fs.copyFileSync(__dirname + '/gen/keys/validator-server.pub', configDir + '/keys/server.pub');

        // Create config
        const validatorConfig = createValidatorConfig({
            ip: ipToInt(Config.validators.endpoints[i]),
            port,
            adnlMain: fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-adnl-main.uid', 'utf-8'),
            adnlDht: fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-adnl-dht.uid', 'utf-8'),
            adnlValidator: fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-adnl-validator.uid', 'utf-8'),
            validatorKey: fs.readFileSync(__dirname + '/gen/keys/validator-' + (i + 1) + '-validator.uid', 'utf-8'),
            validatorExpire: Math.floor(Date.now() / 1000 + 1000000),
            controlServer: fs.readFileSync(__dirname + '/gen/keys/validator-server.uid', 'utf-8'),
            controlClient: fs.readFileSync(__dirname + '/gen/keys/validator-client.uid', 'utf-8'),
            liteServer: fs.readFileSync(__dirname + '/gen/keys/lite-server.uid', 'utf-8'),
        });
        let validatorStr = JSON.stringify(validatorConfig, null, 4);
        fs.writeFileSync(configDir + '/db/config.json', validatorStr);

        // Liteserver config
        networkLiteServers.push({
            "ip": ipToInt(Config.validators.endpoints[i]),
            "port": 51935,
            "id": {
                "@type": "pub.ed25519",
                "key": fs.readFileSync(__dirname + '/gen/keys/lite-server.uid', 'utf-8')
            }
        });
    }

    // Load zerostates
    const zerostate_fhash = fs.readFileSync(__dirname + '/gen/zerostate/zerostate.fhash').toString('base64');
    const zerostate_rhash = fs.readFileSync(__dirname + '/gen/zerostate/zerostate.rhash').toString('base64');

    // Generate network config
    let config = JSON.stringify({
        "@type": "config.global",
        "dht": {
            "@type": "dht.config.global",
            "k": Config.dht.maxReplication,
            "a": Config.dht.maxRequestPerSecond,
            "static_nodes": {
                "@type": "dht.nodes",
                "nodes": networkConfig
            }
        },
        liteservers: networkLiteServers,
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
    fs.writeFileSync(__dirname + '/gen/config.net.json', config);
    for (let i = 0; i < Config.dht.endpoints.length; i++) {
        fs.writeFileSync(__dirname + '/gen/nodes/dht-' + (i + 1) + '/config.net.json', config);
    }
    for (let i = 0; i < Config.validators.endpoints.length; i++) {
        fs.writeFileSync(__dirname + '/gen/nodes/validator-' + (i + 1) + '/config.net.json', config);
    }
})();