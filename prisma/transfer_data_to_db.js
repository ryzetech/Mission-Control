import { PrismaClient } from '@prisma/client';

// load the db from db.json
function loadDB() {
  let stuff = fs.readFileSync("./../db.json", "utf8");
  db = JSON.parse(stuff);
  userData = db[0];
  clanData = db[1];
}

// transfer data
const transfer = async () => {
  var userData = [];
  var db = [];

  loadDB();

  const prisma = new PrismaClient();

  userData.forEach(user => {
    console.log(`(transfer) Transferring user ${user.id}...`);
    await prisma.user.create({
      data: user
    });
  })
}

// execute transfer
transfer();
