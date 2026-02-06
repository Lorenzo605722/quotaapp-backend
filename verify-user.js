const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.update({
        where: { email: 'lorenzo@gmail.com' },
        data: { emailVerified: true }
    });
    console.log('--- USER VERIFIED MANUALLY ---');
    console.log(JSON.stringify(user, null, 2));
    console.log('------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
