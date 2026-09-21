const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const merchants = await prisma.merchant.findMany({ select: { id: true, slug: true, businessName: true } });
    const txCount = await prisma.transaction.count();
    const anchorCount = await prisma.anchorRecord.count();
    const logCount = await prisma.relayerLog.count();
    console.log('Merchants (' + merchants.length + '):', merchants);
    console.log('Tx count:', txCount, 'Anchor count:', anchorCount, 'Log count:', logCount);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
check();
