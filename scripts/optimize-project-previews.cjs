const sharp=require('sharp');
const path=require('node:path');
const fs=require('node:fs/promises');
const dir=path.resolve(__dirname,'../public/images/projects');
(async()=>{for(const [source,target,width] of [
 ['bigbass-mobile.webp','bigbass-mobile-preview.webp',640],
 ['liberty-mobile.webp','liberty-mobile-preview.webp',640],
 ['bigbass-home.webp','bigbass-home-preview.webp',1200],
 ['liberty-home.webp','liberty-home-preview.webp',1200],
 ['bigbass-logo.png','bigbass-logo-preview.webp',240],
 ['liberty-brand.png','liberty-brand-preview.webp',240]]){
 await sharp(path.join(dir,source)).resize({width,withoutEnlargement:true}).webp({quality:80,effort:6}).toFile(path.join(dir,target));
 console.log(target,(await fs.stat(path.join(dir,target))).size);
}})().catch(e=>{console.error(e);process.exitCode=1});
