import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import process from 'process';
import fs from 'fs';
import { Config } from './script-config';

function generateKey(name: string) {
    if (!fs.existsSync(name + '.pub')) {
        let res = execSync('/usr/bin/ton/utils/generate-random-id -m keys -n ' + name).toString().trim().split(' ');
        if (res.length !== 2) {
            throw Error('Invalid keys');
        }
        fs.writeFileSync(name + '.id', res[0]);
        fs.writeFileSync(name + '.uid', res[1]);
    }

}

(async () => {

    // Create directories
    await mkdirp(__dirname + '/gen/keys');
    process.chdir(__dirname + '/gen/keys');

    // Generate Validator Server Key
    generateKey('validator-server');
    generateKey('validator-client');
    generateKey('lite-server');

    // Generate Validator Keys
    let output: Buffer = Buffer.alloc(0);
    for (let i = 0; i < Config.validators.endpoints.length; i++) {
        generateKey('validator-' + (i + 1) + '-validator');
        generateKey('validator-' + (i + 1) + '-adnl-main');
        generateKey('validator-' + (i + 1) + '-adnl-dht');
        generateKey('validator-' + (i + 1) + '-adnl-validator');
        let fname = 'validator-' + (i + 1) + '-validator.pub';
        let pub = fs.readFileSync(fname).slice(4);
        output = Buffer.concat([output, pub]);
    }
    fs.writeFileSync('validator-keys.pub', output);

    // Generate DHT Keys
    for (let i = 0; i < Config.dht.endpoints.length; i++) {
        generateKey('dht-' + (i + 1));
    }
})();