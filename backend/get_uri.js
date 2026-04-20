const dns = require('dns').promises;
const fs = require('fs');

async function getStandardURI() {
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        const srvRecords = await dns.resolveSrv('_mongodb._tcp.cluster0.to5nncj.mongodb.net');
        const txtRecords = await dns.resolveTxt('cluster0.to5nncj.mongodb.net');

        const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
        const options = txtRecords.flat().join('&');

        const uri = `mongodb://udashiv18_db_user:R9wpZxxMVs6LU9pW@${hosts}/qr-menu?ssl=true&${options}`;
        fs.writeFileSync('uri.txt', uri);
        console.log('STANDARD_URI=' + uri);
    } catch (err) {
        console.error(err);
    }
}

getStandardURI();
