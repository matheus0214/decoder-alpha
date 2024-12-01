import { Contract, formatUnits, JsonRpcProvider } from "ethers";
import { abi } from "./abi";


class ContractProvider {
	private contractAddress = "0xb2ea51BAa12C461327d12A2069d47b30e680b69D";
	private contract: Contract;
	private provider = new JsonRpcProvider("https://bsc-dataseed.binance.org/");

	constructor() {
		this.contract = new Contract(this.contractAddress, abi, this.provider);
	}

	async getBalance(wallet: string) {
		try {
			const balance = await this.contract.balanceOf(wallet);
			return formatUnits(balance, 18);
		} catch (error) {
			console.error("Error calling balanceOf:", error);
			return null;
		}
	}
}

export const contractProvider = new ContractProvider()
