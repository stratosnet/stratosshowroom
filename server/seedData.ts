import { storage } from './storage';
import { log } from './vite';

interface SampleVideo {
  cid: string;
  cidUri: string;
  fileHash: string;
  fileUri: string;
  title: string;
  type: string;
  description: string;
  category: string;
  size?: number;
  duration?: number;
}

// Add a single sample video with error handling
async function addSampleVideo(videoData: SampleVideo) {
  try {
    // Check if we already have this video by hash
    // const existingVideo = await storage.getVideoByHash(videoData.fileHash);
    
    // if (existingVideo) {
    //   // If the video exists but doesn't have a thumbnail, update it
    //   if (!existingVideo.thumbnailUri) {
    //     const thumbnailUri = `https://${videoData.fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=25`;
    //     const updatedVideo = await storage.updateVideo(existingVideo.id, { thumbnailUri });
    //     log(`Updated existing video with ID: ${existingVideo.id} with a thumbnail`, 'seed');
    //     return updatedVideo || existingVideo;
    //   }
      
    //   log(`Sample video already exists with ID: ${existingVideo.id}`, 'seed');
    //   return existingVideo;
    // }
    
    // // Generate thumbnail URI using subdomain-style URL with frame parameter at 25%
    // const thumbnailUri = `https://${videoData.fileHash}.ipfs.spfs-gateway.thestratos.net/?frame=25`;
    
    // Create a new sample video
    const sampleVideo = await storage.createVideo({
      cid: videoData.cid,
      cidUri: videoData.cidUri,
      type: videoData.type,
      title: videoData.title,
      description: videoData.description,
      fileHash: videoData.fileHash,
      fileUri: videoData.fileUri,
      category: videoData.category,
      size: videoData.size || 10485760, // Default 10MB if not specified
      duration: videoData.duration || 60, // Default 1 minute if not specified
      thumbnailUri: null,
      userId: null,
      metadata: {
        uploadedFrom: 'sample'
      }
    });
    
    log(`Added sample video: ${sampleVideo.title} with ID: ${sampleVideo.id}`, 'seed');
    return sampleVideo;
  } catch (error) {
    log(`Error adding sample video (${videoData.title}): ${error instanceof Error ? error.message : String(error)}`, 'seed');
    // Don't throw so other videos can still be added
    return null;
  }
}

// Add the F1 trailer video
export async function seedSampleVideo() {
  try {
    // Original F1 sample video
    await addSampleVideo({
      cid:"",
      cidUri:"",
      type:"video/mp4",
      fileHash: 'bafybeictblsvwrpi4pftsic5asdbcgb55qzmp4b4gjkxnno6jxw7mzqi4q',
      fileUri:"",
      title: 'F1 Official Trailer',
      description: 'Official Formula 1 trailer showcasing racing excitement',
      category: 'Sports',
      size: 12582912,
      duration: 90
    });
    
    // Additional sample videos the user requested
    const additionalVideos: SampleVideo[] = [
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeiazrzwxuf3kti3raxysuwmx4siqabjvhbegydxnoxvgoujvykpv4a',
        fileUri:"",
        title: 'DOOM - The Only Thing They Fear',
        description: 'Intense soundtrack from the DOOM video game',
        category: 'Gaming',
        duration: 120
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeigivvgexk6zft546ckrpy7jck2cbuie6fp772olj6sny3t6hmmr4y',
        fileUri:"",
        title: '20 Small And Cute Exotic Animals',
        description: 'A compilation of adorable exotic animals from around the world',
        category: 'Animals',
        duration: 180
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeihp5y7afeun3anx5pyxj4ts3rfcz5n34fgk3iajh7ndy2pn6hdhne',
        fileUri:"",
        title: 'Ace Ventura in Middle-Earth',
        description: 'A humorous mashup of Ace Ventura and Lord of the Rings',
        category: 'Entertainment',
        duration: 150
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeidgf5adbrwf35n7if4xlm34x5vs3742aml5ijt6kjwozogrxv4t7u',
        fileUri:"",
        title: 'All Aboard To Jurassic Park',
        description: 'A creative remix of the classic Jurassic Park scenes',
        category: 'Entertainment',
        duration: 135
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4", 
        fileHash: 'bafybeifmlhte7dr6h2iiz2ya2sc36ymtocu5ooam7mdr4k2xf2fbqieody',
        fileUri:"",
        title: 'Astartes II – Official Teaser Trailer',
        description: 'Fan-made Warhammer 40K animation teaser trailer',
        category: 'Gaming',
        duration: 90
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeih6xvwx3zxeykhsccwyjye2vgmx4bdf53lz5uf6y7scu7jlaw3cdm',
        fileUri:"",
        title: 'Scary Movie 3: Friendly Aliens',
        description: 'Comedy scene from Scary Movie 3 featuring aliens',
        category: 'Comedy',
        duration: 110
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeieke3ctwziwunlgpdmjmwk6ira5pinoptjdzuwcipebeo2gytylaq',
        fileUri:"",
        title: 'SONIC X SHADOW GENERATIONS: Dark Beginnings',
        description: 'Trailer for the Sonic X Shadow Generations game',
        category: 'Gaming',
        duration: 95
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeig7fizzmdrastujwkq6xtaqwitc2j4x4ottxrrtrmmf3dzaaym634',
        fileUri:"",
        title: 'The Alps 4K Drone & iPhone X',
        description: 'Breathtaking aerial footage of the Alps mountains',
        category: 'Travel',
        duration: 240
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeibro5fiyfmnktx5676d5rewpso755rjxnugxszzu3slkvo36xech4',
        fileUri:"",
        title: 'The T.rex Escapes the Paddock - Jurassic Park',
        description: 'Iconic scene from the original Jurassic Park movie',
        category: 'Movies',
        duration: 120
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeidy4hpe7dvkccbttnucduzrbe27xjwzu6narq3lnnibdkdzyea33m',
        fileUri:"",
        title: 'World of Warcraft: The Night Elves - Cinematic [4K]',
        description: 'High-quality cinematic featuring Night Elves from World of Warcraft',
        category: 'Gaming',
        duration: 180
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeictwh2f3vjb7yftrvw7mv2vmks2yo5bvcnf2aqiyq34f5ixj5cj6y',
        fileUri:"",
        title: 'Bulgaria 8K HDR 60P',
        description: 'Stunning high-definition footage of Bulgaria landscapes',
        category: 'Travel',
        duration: 300
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeidu2hvikonrisopm5bsyloqmq6dc2lrfd4zyspfqixccm3idnvapm',
        fileUri:"",
        title: 'Hawaii in 8K | HDR 60FPS',
        description: 'Beautiful high-definition footage of Hawaii islands',
        category: 'Travel',
        duration: 270
      },
      {
        cid:"",
        cidUri:"",
        type:"video/mp4",
        fileHash: 'bafybeicujsshgrh5scbhuoyktt4rrpnu3ydfdjyxkh3gdbcvlakdatlh6m',
        fileUri:"",
        title: 'This is Indonesia - CINEMATIC TRAVEL FILM',
        description: 'Cinematic travel footage showcasing Indonesia\'s beauty',
        category: 'Travel',
        duration: 240
      },
      // {
      //   cid: "",
      //   cidUri:"",
      //   type: "image/png",
      //   title: "appstore",
      //   description: "",
      //   fileHash: "QmekANfKc2o8ZSPq1j5pRCRuarRX3swVDietJb7ffyft7A",
      //   fileUri: "",
      //   duration: 0,
      //   size: 92505,
      //   category: "Blockchain",
      // },
      // {
      //   cid: "",
      //   cidUri: "",
      //   type: "image/svg+xml",
      //   title: "favion",
      //   description: "",
      //   fileHash: "QmbJwwDpYyjJMMCezJBpgPR5zP2f6DMFrr8DwUuRFjRBw2",
      //   fileUri: "",
      //   duration: 0,
      //   size: 1780,
      //   category: "Blockchain",
      // },
      {
        cid: "",
        cidUri: "",
        type: "audio/mpeg",
        title: "sample song",
        description: "",
        fileHash: "QmSS2QLcn2PLMYNrZSz5JfyQQwRk96dLT1n9JoU3LSz2Hg",
        fileUri: "",
        duration: 0,
        size: 7373059,
        category: "",
      },

//https://spfs-gateway.thestratos.net/ipfs/QmUCgwAKmAiTic7Lz1gm9L53HKtfQ8hx42tHo2cdY5bjWA
//https://spfs-gateway.thestratos.net/ipfs/QmcguvPEm5p5vMRYjBJeWHZkH2SEp96ndFq4QBf8pHmRfA
//https://spfs-gateway.thestratos.net/ipfs/QmapNRPVTvCDZsuR6iXqEuEPcBNtaZAsuGvjdDC3y8YdoX
//https://spfs-gateway.thestratos.net/ipfs/QmQSFAUt8UKw4FKC7rNWrcUgYk7YazFZox7n9yvWVQMRq7
//https://spfs-gateway.thestratos.net/ipfs/QmezgViSfd4VseYhZpAXR1LaFQuy8KghC25T5yuAXAHw9k
//https://spfs-gateway.thestratos.net/ipfs/QmTsQJYQj6tHnniESGUDDpxpQpZjhrtEi5UAEU57FFT59i
{
  cid: "",
  cidUri:"",
  type: "image/jpeg",
  title: "sample image 1",
  description: "",
  fileHash: "QmQSFAUt8UKw4FKC7rNWrcUgYk7YazFZox7n9yvWVQMRq7",
  fileUri: "",
  duration: 0,
  size: -1,
  category: "",
},
{
  cid: "",
  cidUri:"",
  type: "image/jpeg",
  title: "sample image 1",
  description: "",
  fileHash: "QmTsQJYQj6tHnniESGUDDpxpQpZjhrtEi5UAEU57FFT59i",
  fileUri: "",
  duration: 0,
  size: -1,
  category: "",
},

{
  cid: "",
  cidUri:"",
  type: "image/jpeg",
  title: "sample image 2",
  description: "",
  fileHash: "QmezgViSfd4VseYhZpAXR1LaFQuy8KghC25T5yuAXAHw9k",
  fileUri: "",
  duration: 0,
  size: -1,
  category: "",
},

{
  cid: "",
  cidUri:"",
  type: "image/jpeg",
  title: "sample image 3",
  description: "",
  fileHash: "QmapNRPVTvCDZsuR6iXqEuEPcBNtaZAsuGvjdDC3y8YdoX",
  fileUri: "",
  duration: 0,
  size: -1,
  category: "",
},
      
      {
        cid: "",
        cidUri:"",
        type: "image/jpeg",
        title: "sample image 4",
        description: "",
        fileHash: "QmUCgwAKmAiTic7Lz1gm9L53HKtfQ8hx42tHo2cdY5bjWA",
        fileUri: "",
        duration: 0,
        size: -1,
        category: "",
      },
      {
        cid: "",
        cidUri:"",
        type: "image/jpeg 5",
        title: "sample image",
        description: "",
        fileHash: "QmcguvPEm5p5vMRYjBJeWHZkH2SEp96ndFq4QBf8pHmRfA",
        fileUri: "",
        duration: 0,
        size: -1,
        category: "",
      },

    ];
    
    // Process all videos sequentially
    for (const video of additionalVideos) {
      await addSampleVideo(video);
    }
    
    log('Completed adding all sample videos', 'seed');
  } catch (error) {
    log(`Error seeding sample videos: ${error instanceof Error ? error.message : String(error)}`, 'seed');
    throw error;
  }
}