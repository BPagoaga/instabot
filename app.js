import { readFile } from "fs/promises";
import { IgCheckpointError } from "instagram-private-api";
import { login, solveCheckpoint } from "./instagram-client.js";

// Retry an API call once after solving a checkpoint challenge
function isCheckpoint(error) {
  return error instanceof IgCheckpointError
    || error?.message?.includes('checkpoint_required')
    || error?.message?.includes('challenge_required');
}

function isUnsupportedVersion(error) {
  return error?.response?.body?.checkpoint_url?.includes('unsupported_version');
}

async function withCheckpoint(fn) {
  try {
    return await fn();
  } catch (error) {
    if (isCheckpoint(error)) {
      if (isUnsupportedVersion(error)) {
        throw new Error('Instagram has blocked this session as unsupported. Delete ig-session.json and log in again.');
      }
      await solveCheckpoint(error);
      return await fn();
    }
    throw error;
  }
}

const toUnfollow = [];
const following = [];
const followers = [];
const exclude = [];

const getExclude = async () => {
  exclude.push(...JSON.parse(await readFile("./exclude.json", "utf-8")));
};

const compare = () => {
  following.forEach((followingAcc) => {
    if (!followers.includes(followingAcc) && !exclude.includes(followingAcc)) {
      toUnfollow.push(followingAcc);
    }
  });

  console.warn(`You should unfollow ${toUnfollow.toString()}`);
};

const main = async () => {
  await getExclude();

  // Initialize Instagram client with login
  const ig = await login();
  
  // Get the logged-in user's ID
  const userId = ig.state.cookieUserId;

  console.log('Fetching followers...');

  // Fetch all followers using instagram-private-api
  const followersFeed = ig.feed.accountFollowers(userId);

  do {
    const followersChunk = await withCheckpoint(() => followersFeed.items());
    followers.push(...followersChunk.map(user => user.username));
  } while (followersFeed.isMoreAvailable());

  console.info(`You have ${followers.length} followers`);

  // Fetch all following
  console.log('Fetching following...');

  const followingFeed = ig.feed.accountFollowing(userId);

  do {
    const followingChunk = await withCheckpoint(() => followingFeed.items());
    following.push(...followingChunk.map(user => user.username));
  } while (followingFeed.isMoreAvailable());

  console.info(`You are following ${following.length} people`);
  compare();
};

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
