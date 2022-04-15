export function createDHTConfig(ip: number, port: number, id: string) {
    return (
        {

            "@type": "engine.validator.config",

            "out_port": 3278,

            "addrs": [

                {

                    "@type": "engine.addr",

                    "ip": ip,

                    "port": port,

                    "categories": [

                        0,

                        1,

                        2,

                        3

                    ],

                    "priority_categories": [

                    ]

                }

            ],

            "adnl": [

                {

                    "@type": "engine.adnl",

                    "id": id,

                    "category": 0

                }

            ],

            "dht": [

                {

                    "@type": "engine.dht",

                    "id": id

                }

            ],

            "validators": [

            ],

            "fullnode": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",

            "fullnodeslaves": [

            ],

            "fullnodemasters": [

            ],

            "liteservers": [

            ],

            "control": [

            ],

            "gc": {

                "@type": "engine.gc",

                "ids": [

                ]

            }

        }
    );
}