import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

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

Clarinet.test({
    name: "Cannot register food item with too many certifications",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii("Apple"),
                types.ascii("Farm A"),
                types.list([
                    types.ascii("Cert1"),
                    types.ascii("Cert2"),
                    types.ascii("Cert3"),
                    types.ascii("Cert4"),
                    types.ascii("Cert5"),
                    types.ascii("Cert6"),
                    types.ascii("Cert7"),
                    types.ascii("Cert8"),
                    types.ascii("Cert9"),
                    types.ascii("Cert10"),
                    types.ascii("Cert11")
                ]),
                types.none()
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectErr().expectUint(103);
    }
});
