/**
 * Hash a plain password for ADMIN_PASSWORD_HASH.
 * Usage: node scripts/hash-password.js "YourStrongPassword"
 */

const bcrypt = require('bcrypt');

const pwd = process.argv[2];
if (!pwd) {
    console.error('Usage: node scripts/hash-password.js "<password>"');
    process.exit(1);
}

bcrypt
    .hash(pwd, 12)
    .then((hash) => {
        console.log('Set this in backend/.env as ADMIN_PASSWORD_HASH:');
        console.log(hash);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
