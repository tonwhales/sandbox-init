import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import process from 'process';
import fs from 'fs';

(async () => {

    // Create directory
    if (fs.existsSync(__dirname + '/gen/giver')) {
        return;
    }
    rimraf.sync(__dirname + '/gen/giver');
    await mkdirp(__dirname + '/gen/giver');
    process.chdir(__dirname + '/gen/giver/');

    // Create zerostate
    execSync(__dirname + '/new-giver.fif 0 2 100 600 16 16 100', { stdio: 'inherit' });
})();