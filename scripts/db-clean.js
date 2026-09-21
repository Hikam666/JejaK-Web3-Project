const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Cleaning database for fresh production deployment...');
    const deletedTx = await prisma.transaction.deleteMany({});
    console.log(`Deleted ${deletedTx.count} test transactions.`);

    const deletedAnchors = await prisma.anchorRecord.deleteMany({});
    console.log(`Deleted ${deletedAnchors.count} test anchor records.`);

    const deletedMerchants = await prisma.merchant.deleteMany({});
    console.log(`Deleted ${deletedMerchants.count} test merchants.`);

    const deletedLogs = await prisma.relayerLog.deleteMany({});
    console.log(`Deleted ${deletedLogs.count} test relayer logs.`);

    console.log('✅ Database is now 100% clean and ready for production deployment!');
  } catch (err) {
    console.error('Error cleaning database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
