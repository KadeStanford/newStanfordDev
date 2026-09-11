const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
async function main(){
 const icon=await fs.readFile(path.join(root,'public/favicon.svg'));
 const sizes=[16,32,48],pngs=await Promise.all(sizes.map(size=>sharp(icon).resize(size,size).png().toBuffer()));
 const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
 let offset=header.length;
 pngs.forEach((png,i)=>{const entry=6+i*16;header[entry]=sizes[i];header[entry+1]=sizes[i];header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(png.length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=png.length;});
 await fs.writeFile(path.join(root,'public/favicon.ico'),Buffer.concat([header,...pngs]));
 await sharp(icon).resize(180,180).png().toFile(path.join(root,'public/apple-touch-icon.png'));
 const encode=async name=>'data:image/png;base64,'+(await sharp(path.join(root,'public/images/projects',name)).resize(440,952,{fit:'cover'}).png().toBuffer()).toString('base64');
 const bass=await encode('bigbass-mobile.webp'),liberty=await encode('liberty-mobile.webp');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <defs><radialGradient id="glow"><stop stop-color="#385031"/><stop offset="1" stop-color="#080e12"/></radialGradient><clipPath id="screen"><rect x="8" y="8" width="220" height="476" rx="24"/></clipPath></defs>
 <rect width="1200" height="630" fill="#080e12"/><ellipse cx="937" cy="340" rx="335" ry="335" fill="url(#glow)"/>
 <ellipse cx="913" cy="338" rx="264" ry="199" fill="none" stroke="#a5c480" stroke-opacity=".25" transform="rotate(-24 913 338)"/>
 <image href="data:image/svg+xml;base64,${icon.toString('base64')}" x="48" y="48" width="94" height="94"/>
 <g font-family="Arial,sans-serif" fill="#edf1ee"><text x="163" y="86" font-size="25" font-weight="700">Stanford</text><text x="163" y="119" font-size="25">Development Solutions</text>
 <text x="58" y="270" font-size="55" font-weight="700" letter-spacing="-2">Websites built</text><text x="58" y="337" font-size="55" font-weight="700" letter-spacing="-2">around</text>
 <text x="58" y="410" font-family="Georgia,serif" font-style="italic" font-size="64" fill="#c8f06b">your business.</text>
 <text x="60" y="538" font-size="20" fill="#b6c4bb">Web design · Development · Advertising</text></g>
 <g transform="translate(900 47) rotate(10 118 246)"><rect width="236" height="492" rx="32" fill="#131d17" stroke="#849a89" stroke-width="3"/><image href="${liberty}" x="8" y="8" width="220" height="476" clip-path="url(#screen)"/></g>
 <g transform="translate(710 107) rotate(-9 118 246)"><rect width="236" height="492" rx="32" fill="#131d17" stroke="#a5b5a6" stroke-width="3"/><image href="${bass}" x="8" y="8" width="220" height="476" clip-path="url(#screen)"/></g>
 </svg>`;
 await sharp(Buffer.from(svg)).png().toFile(path.join(root,'public/images/sds-social-preview.png'));
 console.log('Generated favicon.ico, apple-touch-icon.png, and sds-social-preview.png');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
