import {ethers} from 'ethers';

const ETHERSCAN_TOKEN_API = process.env.ETHERSCAN_TOKEN_API;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const POCKET_PORTAL_ID = process.env.POCKET_PORTAL_ID;

export const provider = new ethers.providers.getDefaultProvider(null, {
  etherscan: ETHERSCAN_TOKEN_API,
  infura: INFURA_PROJECT_ID,
  alchemy: ALCHEMY_API_KEY,
  pocket: POCKET_PORTAL_ID
});
