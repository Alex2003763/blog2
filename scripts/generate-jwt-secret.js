const crypto = require('crypto');

// 生成 32 位元組的隨機密鑰
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('='.repeat(50));
console.log('JWT 密鑰已生成！');
console.log('='.repeat(50));
console.log('');
console.log('請將以下密鑰複製到您的 .env.local 文件中：');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('注意：請妥善保管此密鑰，不要將其提交到 Git 儲存庫！');
console.log('='.repeat(50));