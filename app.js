import { readFile } from 'fs/promises';
import { getIgResponse } from "./http.js";
import 'dotenv/config';

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
         nextPage,
         "follow_list_page",
         "followers"
      ));

      nextPage = data.next_max_id;
      hasNextPage = !!nextPage;
      
      followers.push(...data.users
      .map((user) => user.username)
      .filter((username) => !!username));
      
   } while (hasNextPage);

   console.info(`You have ${followers.length} followers`);
   
   do {
      const data = (await getIgResponse(
         userId,
         sessionId, 
         nextPage,
         "follow_list_page",
         "following"
      ));
      
      nextPage = data.next_max_id;
      hasNextPage = !!nextPage;
      
      following.push(...data.users
      .map((user) => user.username)
      .filter((username) => !!username));
      
   } while (hasNextPage);
   
   console.info(`You are following ${following.length} people`);
   compare();
}

main();
