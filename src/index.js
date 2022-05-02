import 'dotenv/config';
import {ethers} from 'ethers';
import {contractIsAProxy, getAbi, getImplementationAddress} from './ethereum/contractUtils.js';
import {provider} from './ethereum/ethereumUtils.js';
import formatThousands from 'format-thousands';

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
  totalReserve = v1DaiReserve * 1 + v2DaiReserve * 1 + v2AAMDaiReserve * 1;
} while (currentBlock !== await provider.getBlockNumber());

console.log(`At block ${currentBlock}`);
console.log(`Available DAI reserve on Aave V1 : ${formatThousands(v1DaiReserve)}`);
console.log(`Available DAI reserve on Aave V2 : ${formatThousands(v2DaiReserve)}`);
console.log(`Available DAI reserve on Aave V2 (AAM) : ${formatThousands(v2AAMDaiReserve)}`);
console.log(`Total available DAI reserve : ${formatThousands(totalReserve)}`);

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

    return ethers.utils.formatEther(availableLiquidity);
  } catch (error) {
    console.error(`An error occurred while retrieving DAI reserve for ${contractAddress} : `);
    console.error(error);
    throw error;
  }
}
