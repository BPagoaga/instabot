import { readFile } from 'fs/promises';
import { getIgResponse } from "./http.js";
require('dotenv').config();   

const { userId, sessionId, followersQueryHash, followingQueryHash } = process.env;
const toUnfollow = [];
const following = [];
const followers = [];
const exclude = [];

const getExclude = async (file) => {
   // iterate over files in following folder
   exclude.push(...JSON.parse(await readFile("./exclude.json", "utf-8")));  
}

const compare = () => {
   following.forEach((followingAcc) => {
      if (!followers.includes(followingAcc) && !exclude.includes(followingAcc)) {
         toUnfollow.push(followingAcc);
      }
   });

   console.warn(`You should unfollow ${toUnfollow.toString()}`);
}

const main = async () => {
   await getExclude();

   let hasNextPage = false;
   let nextPage = "";

   do {
      const data = (await getIgResponse(
         userId,
         sessionId, 
         followersQueryHash,
         nextPage
      )).data;

      nextPage = data.user?.edge_followed_by?.page_info?.end_cursor;
      hasNextPage = !!nextPage;
      
      followers.push(...data.user?.edge_followed_by?.edges.filter((edge) => !!edge)
      .map((edge) => edge?.node?.username)
      .filter((username) => !!username));
      
   } while (hasNextPage);

   console.info(`You have ${followers.length} followers`);
   
   do {
      const data = (await getIgResponse(
         userId,
         sessionId, 
         followingQueryHash,
         nextPage
      )).data;
      
      nextPage = data.user?.edge_follow?.page_info?.end_cursor;
      hasNextPage = !!nextPage;
      
      following.push(...data.user?.edge_follow?.edges.filter((edge) => !!edge)
      .map((edge) => edge?.node?.username)
      .filter((username) => !!username));
      
   } while (hasNextPage);
   
   console.info(`You are following ${following.length} people`);
   compare();
}

main();
