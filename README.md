# Generate New TON-based blockchain

It is done in three steps:

1) Generate keys for various parts of bootstrap network (there are lot of them!)
2) Generate Zerostate
3) Generate Node's configuration

In general you need at least one DHT node and at least one validator. To participate in elections you need at least three validators running, but network could be bootstrapped with a single one.

## Configuration
You need to edit configuration of initial network in `script-config.ts`.

## Keys

To generate keys execute command:
```yarn keys```

This will generate:
* One key for each DHT server
* One common lite server key
* One common validator control server key
* One common validator control client key
* One validation key per validator
* Three ADNL keys per validator

## Zerostate

To generate zerostate execute command:
```yarn zerostate```
this will generate zerostate for network

## Nodes

To generate configuration for nodes execute command:
```yarn nodes```

Then copy to nodes and launch network starting from DHT.

# License
MIT