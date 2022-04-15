import { execSync } from 'child_process';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

// Create directory
rimraf.sync(__dirname + '/output/');
mkdirp(__dirname + '/output/');

// Create validator keys
execSync('/usr/bin/ton/utils/generate-random-id -m keys -n ');

// Create zerostate
execSync('/usr/bin/ton/crypto/create-state -I /usr/src/ton/crypto/fift/lib  -I /usr/src/ton/crypto/smartcont/ ./gen-zerostate.fif', { stdio: 'inherit' });