import 'dotenv/config';
import {ethers} from 'ethers';
import {contractIsAProxy, getAbi, getImplementationAddress} from './ethereum/contractUtils.js';
import {provider} from './ethereum/ethereumUtils.js';
import bigDecimal from 'js-big-decimal';

const v1LPContractAddress = process.env.AAVE_V1_LENDING_POOL_CONTRACT_ADDRESS;
const v2PDPContractAddress = process.env.AAVE_V2_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS;
const v2AAMPDPContractAddress = process.env.AAVE_V2_AAM_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS;

let v1DaiReserve;
let v2DaiReserve;
let v2AAMDaiReserve;
let totalReserve;
let currentBlock;

do {
  currentBlock = await provider.getBlockNumber();
  v1DaiReserve = await getDaiReserve(v1LPContractAddress, false);
  v2DaiReserve = await getDaiReserve(v2PDPContractAddress, true);
  v2AAMDaiReserve = await getDaiReserve(v2AAMPDPContractAddress, true);
  totalReserve = v1DaiReserve.add(v2DaiReserve).add(v2AAMDaiReserve);
} while (currentBlock !== await provider.getBlockNumber());

console.log(`At block ${currentBlock}`);
console.log(`Available DAI reserve on Aave V1: ${v1DaiReserve.getPrettyValue()}`);
console.log(`Available DAI reserve on Aave V2: ${v2DaiReserve.getPrettyValue()}`);
console.log(`Available DAI reserve on Aave V2 (AAM): ${v2AAMDaiReserve.getPrettyValue()}`);
console.log(`Total available DAI reserve: ${totalReserve.getPrettyValue()}`);

async function getDaiReserve(contractAddress, isV2) {
  try {
    let abi = await getAbi(contractAddress);

    if (contractIsAProxy(abi)) {
      contractAddress = await getImplementationAddress(contractAddress);
      abi = await getAbi(contractAddress);
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);
    let availableLiquidity;
    const reserveData = await contract.getReserveData(process.env.DAI_CONTRACT_ADDRESS);
    if (!isV2) {
      availableLiquidity = reserveData.availableLiquidity;
    } else {
      availableLiquidity = reserveData[0];
    }

    return new bigDecimal(ethers.utils.formatEther(availableLiquidity));
  } catch (error) {
    console.error(`An error occurred while retrieving DAI reserve for ${contractAddress} : `);
    console.error(error);
    throw error;
  }
}
