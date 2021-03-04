import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

let prisma;

if (process.env.NODE_ENV === 'production') {
  console.log("(prisma) : new instance created");
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    console.log("(prisma) : new instance created");
    global.prisma = new PrismaClient();
  }
  console.log("(prisma) : used global instance");
  prisma = global.prisma;
}

export default prisma;