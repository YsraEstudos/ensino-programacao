const gate = process.argv[2];
if (!['lint', 'typecheck'].includes(gate)) process.exit(2);
console.log(`${gate} gate declared`);
