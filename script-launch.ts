import { execSync } from 'child_process';
import rimraf from 'rimraf';
import copy from 'recursive-copy';
import fs from 'fs';

(async () => {
    // Stopping validator
    console.log('Stopping validator...');
    execSync('systemctl stop validator');
    execSync('systemctl stop mytoncore');

    // Copy node configuration
    console.log('Copy configuration');
    rimraf.sync('/var/ton-work');
    await copy(__dirname + '/gen/nodes/validator-1', '/var/ton-work');
    process.chdir('/var/ton-work');
    execSync('chown -R validator:validator .');
    fs.writeFileSync('/usr/bin/ton/global.config.json', fs.readFileSync(__dirname + '/gen/config.net.json'));
    
    // Copy main wallet
    console.log('Copy wallets');
    rimraf.sync('/usr/local/bin/mytoncore/wallets/*');
    fs.copyFileSync(__dirname + '/gen/zerostate/main-wallet.pk', '/usr/local/bin/mytoncore/wallets/main-wallet.pk');
    fs.copyFileSync(__dirname + '/gen/zerostate/main-wallet.addr', '/usr/local/bin/mytoncore/wallets/main-wallet.addr');
    fs.copyFileSync(__dirname + '/gen/zerostate/config-master.pk', '/usr/local/bin/mytoncore/wallets/config-master.pk');
    fs.copyFileSync(__dirname + '/gen/zerostate/config-master.addr', '/usr/local/bin/mytoncore/wallets/config-master.addr');

    // Start validator
    console.log('Starting validator...')
    execSync('systemctl start validator');
    execSync('systemctl start mytoncore');
})();