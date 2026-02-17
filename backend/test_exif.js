import parser from 'exif-parser';
console.log('Parser type:', typeof parser);
console.log('Parser keys:', Object.keys(parser));
if (parser.create) {
    console.log('parser.create exists');
} else {
    console.log('parser.create does NOT exist');
}
