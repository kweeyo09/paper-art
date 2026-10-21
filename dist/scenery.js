let imagesPromise;
export function getGardenImages(){
  if(!imagesPromise)imagesPromise=Promise.all(['sunlight','dawn','snow'].map(async mode=>{
    const image=new Image();image.src=new URL(`./scenery/${mode}.jpg`,import.meta.url).href;
    await image.decode();return [mode,image];
  })).then(Object.fromEntries).catch(error=>{imagesPromise=null;throw error;});
  return imagesPromise;
}
