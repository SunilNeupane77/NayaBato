const bcrypt = require('bcryptjs');

const plainPassword = 'sunil123';
const saltRounds = 10; // You can adjust this value

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed Password:', hash);
});
