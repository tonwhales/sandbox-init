export function createDHTPublic(ip: number, port: number) {
    return {
        "@type": "adnl.addressList",
        "addrs": [
            {
                "@type": "adnl.address.udp",
                "ip": ip,
                "port": port
            }
        ],
        "version": 0,
        "reinit_date": 0,
        "priority": 0,
        "expire_at": 0
    }
}