function generateIDs(count) {
  const ids = new Set();

  while (ids.size < count) {
    // Generate a 9-digit random number
    const num = Math.floor(100000000 + Math.random() * 900000000);
    ids.add('T' + num);
  }

  return Array.from(ids);
}

const generatedIDs = generateIDs(100);
console.log(generatedIDs);
