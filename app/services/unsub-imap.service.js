const notifier = require('mail-notifier');
const config = require('../config/config');
const unsub = require('../utils/unsubscribe');

const imap = {
  user:  config.imap_unsub_details.user,
  password:  config.imap_unsub_details.pass,
  host:  config.imap_unsub_details.host,
  port:  config.imap_unsub_details.port,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const n = notifier(imap);
//Keep it running forever :
n.on('end', () => n.start()) // session closed
n.on('error', (err) => {
  console.log("UNSUB: Mail Notifier ERROR:");
  console.log(err);
  try {
    n.start();
  } catch (err) {

  }
}) // session closed
.on('mail', mail => {
  console.log(mail.from[0].address, mail.subject);
  unsub.add(mail.subject);
  //unsub.add('6P1ngrPq0x0UjXdQDjEKhmxvDGZOOQvDXMyUmkxow4Oeo1oZ84Tsv03MPZu8F8w71+b4fMFErTyzQIyRz2FyeQ==');
})
.start();

