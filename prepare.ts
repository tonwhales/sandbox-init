import { execSync } from 'child_process';

// Create validator keys
// TODO: Implement

// Create zerostate
execSync('/usr/bin/ton/crypto/create-state -I /usr/src/ton/crypto/fift/lib  -I /usr/src/ton/crypto/smartcont/ ./gen-zerostate.fif', { stdio: 'inherit' });