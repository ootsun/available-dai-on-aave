import {provider} from './ethereumUtils.js';
import {ethers} from 'ethers';
import axios from 'axios';

export function contractIsAProxy(abi) {
  const iface = new ethers.utils.Interface(abi);
  const methods = Object.values(iface.functions).map(f => f.name);
  return methods.includes('implementation');
}

export async function getImplementationAddress(contractAddress) {
  const address = await provider.getStorageAt(contractAddress, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
  return ethers.utils.hexStripZeros(address);
}

export async function getAbi(address) {
  const res = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_TOKEN_API}`);
  if (res.data.message !== 'OK') {
    const message = 'An error occurred while retrieving abi';
    console.log(message);
    console.log(res.data);
    throw new Error(message);
  }
  return JSON.parse(res.data.result);
}
