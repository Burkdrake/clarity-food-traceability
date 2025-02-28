import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

[... existing tests ...]

Clarinet.test({
    name: "Cannot register food item with empty strings",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii(""),
                types.ascii("Farm A, California"),
                types.list([]),
                types.none()
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectErr().expectUint(103);
    }
});

[... additional new tests ...]
