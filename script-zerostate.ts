import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import process from 'process';
import fs from 'fs';

const INITIAL_VALIDATORS = 3;

(async () => {

    // Create directory
    rimraf.sync(__dirname + '/zerostate');
    await mkdirp(__dirname + '/zerostate');
    process.chdir(__dirname + '/zerostate/');

    // Create validator keys
    let output: Buffer = Buffer.alloc(0);
    for (let i = 0; i < INITIAL_VALIDATORS; i++) {
        execSync('/usr/bin/ton/utils/generate-random-id -m keys -n validator-' + (i + 1));
        let pub = fs.readFileSync('validator-' + (i + 1) + '.pub').slice(4);
        output = Buffer.concat([output, pub]);
    }
    fs.writeFileSync('validator-keys.pub', output);

    // Create zerostate
    execSync('/usr/bin/ton/crypto/create-state -I /usr/src/ton/crypto/fift/lib  -I /usr/src/ton/crypto/smartcont/ ../gen-zerostate.fif', { stdio: 'inherit' });
})();