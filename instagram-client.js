import { IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError } from 'instagram-private-api';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createInterface } from 'readline';
import 'dotenv/config';

const ig = new IgApiClient();
const SESSION_FILE = './ig-session.json';



/**
 * Login to Instagram using username/password
 * Saves session for reuse
 */
export async function login() {
  const { INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } = process.env;
  
  if (!INSTAGRAM_USERNAME || !INSTAGRAM_PASSWORD) {
    throw new Error('Missing INSTAGRAM_USERNAME or INSTAGRAM_PASSWORD in .env file');
  }

  // Try to restore existing session first
  if (existsSync(SESSION_FILE)) {
    try {
      console.log('Attempting to restore saved session...');
      const savedSession = await readFile(SESSION_FILE, 'utf-8');
      await ig.state.deserialize(savedSession);
      console.log('✓ Session restored successfully');
      return ig;
    } catch (error) {
      console.log('Saved session invalid, logging in fresh...');
    }
  }

  // Fresh login
  console.log('Logging in to Instagram...');
  ig.state.generateDevice(INSTAGRAM_USERNAME);

  // Override the hardcoded app version (222.x from 2021) with a current one
  ig.state.constants = {
    ...ig.state.constants,
    APP_VERSION: '361.0.0.34.107',
    APP_VERSION_CODE: '561493796',
  };
  
  try {
    await ig.account.login(INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD);
    console.log('✓ Login successful');
  } catch (error) {
    if (error instanceof IgLoginTwoFactorRequiredError) {
      // Account has 2FA enabled — uses a separate login flow
      const { two_factor_identifier, username } = error.response.body.two_factor_info;
      const code = await prompt('Enter the SMS code you received: ');
      await ig.account.twoFactorLogin({
        username,
        verificationCode: code.trim(),
        twoFactorIdentifier: two_factor_identifier,
        verificationMethod: '1', // 1 = SMS
        trustThisDevice: '1',
      });
      console.log('✓ Two-factor login successful');
    } else if (error instanceof IgCheckpointError) {
      // Account needs identity checkpoint verification
      console.log('Instagram requires checkpoint verification...');
      await ig.challenge.auto(true);
      const code = await prompt('Enter the SMS code you received: ');
      await ig.challenge.sendSecurityCode(code.trim());
      console.log('✓ Checkpoint verification successful');
    } else {
      throw error;
    }
  }

  // Save session for future use
  const serialized = await ig.state.serialize();
  await writeFile(SESSION_FILE, JSON.stringify(serialized));
  console.log('✓ Session saved to', SESSION_FILE);

  return ig;
}

export async function solveCheckpoint(error) {
  // For checkpoint_required, the library doesn't populate ig.state.checkpoint
  // automatically — we have to do it from the error response body
  if (error?.response?.body?.challenge && !ig.state.checkpoint) {
    ig.state.checkpoint = error.response.body;
  }
  await ig.challenge.auto(true);
  const code = await prompt('Instagram checkpoint — enter the SMS code you received: ');
  await ig.challenge.sendSecurityCode(code.trim());
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

export default ig;
