import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import process from 'process';
import fs from 'fs';

(async () => {

    // Create directory
    if (fs.existsSync(__dirname + '/gen/zerostate')) {
        return;
    }
    rimraf.sync(__dirname + '/gen/zerostate');
    await mkdirp(__dirname + '/gen/zerostate');
    process.chdir(__dirname + '/gen/zerostate/');

    // Create validator keys
    fs.copyFileSync(__dirname + '/gen/keys/validator-keys.pub', 'validator-keys.pub');

    // Create zerostate
    execSync('/usr/bin/ton/crypto/create-state -I /usr/src/ton/crypto/fift/lib  -I /usr/src/ton/crypto/smartcont/ ../../gen-zerostate.fif', { stdio: 'inherit' });
})();