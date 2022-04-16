export function createValidatorConfig(args: {
    ip: number,
    port: number,
    adnlMain: string,
    adnlDht: string,
    adnlValidator: string,
    validatorKey: string,
    validatorExpire: number,
    controlServer: string,
    controlClient: string,
    liteServer: string
}) {
    return {
        "@type": "engine.validator.config",
        "out_port": 3278,
        "addrs": [{
            "@type": "engine.addr",
            "ip": args.ip,
            "port": args.port,
            "categories": [0, 1, 2, 3],
            "priority_categories": []
        }],
        "adnl": [{
            "@type": "engine.adnl",
            "id": args.adnlMain,
            "category": 1
        }, {
            "@type": "engine.adnl",
            "id": args.adnlDht,
            "category": 0
        }, {
            "@type": "engine.adnl",
            "id": args.adnlValidator,
            "category": 0
        }, {
            "@type": "engine.adnl",
            "id": args.validatorKey,
            "category": 0
        }],
        "dht": [{
            "@type": "engine.dht",
            "id": args.adnlDht
        }],

        "validators": [{
            "@type": "engine.validator",
            "id": args.validatorKey,
            "temp_keys": [{
                "@type": "engine.validatorTempKey",
                "key": args.validatorKey,
                "expire_at": args.validatorExpire
            }],
            "adnl_addrs": [{
                "@type": "engine.validatorAdnlAddress",
                "id": args.adnlValidator,
                "expire_at": args.validatorExpire
            }],
            "election_date": 0,
            "expire_at": args.validatorExpire
        }],
        "fullnode": args.adnlMain,
        "fullnodeslaves": [
        ],
        "fullnodemasters": [
        ],
        "liteservers": [{
            "@type": "engine.liteServer",
            "id": args.liteServer,
            "port": 51935
        }],
        "control": [{
            "@type": "engine.controlInterface",
            "id": args.controlServer,
            "port": 9691,
            "allowed": [{
                "@type": "engine.controlProcess",
                "id": args.controlClient,
                "permissions": 15
            }
            ]
        }],
        "gc": {
            "@type": "engine.gc",
            "ids": [
            ]
        }
    };
}