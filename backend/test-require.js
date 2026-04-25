console.log('Testing requires...');
const files = [
  './routes/auth',
  './routes/users',
  './routes/messages',
  './routes/conversations'
];

for (const file of files) {
  try {
    console.log(`Requiring ${file}...`);
    require(file);
  } catch (err) {
    console.error(`FAILURE during require of ${file}:`);
    console.error(err.stack);
    process.exit(1);
  }
}
console.log('SUCCESS: All routes required!');
