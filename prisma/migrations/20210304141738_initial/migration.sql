-- CreateTable
CREATE TABLE "LottoTicket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "numberOne" INTEGER NOT NULL,
    "numberTwo" INTEGER NOT NULL,
    "numberThree" INTEGER NOT NULL,
    "numberFour" INTEGER NOT NULL,
    "numberFive" INTEGER NOT NULL
);
