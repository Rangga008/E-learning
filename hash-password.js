const bcrypt = require("bcryptjs");

async function generateHash() {
	const hash = await bcrypt.hash("admin", 10);
	console.log('Hash untuk password "admin":');
	console.log(hash);
}

generateHash().catch(console.error);
