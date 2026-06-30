for (const file of Deno.readDirSync('tests')) {
    if (file.name.includes('main.ts') || !file.isFile) {
        console.log('skipping file', file.name);
        continue;
    }
    
    const path = '#tests/' + file.name;
    console.log('importing tests from', path);
    await import(path);
}
