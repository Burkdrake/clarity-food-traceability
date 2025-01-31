import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can register new food item",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii("Organic Apples"),
                types.ascii("Farm A, California")
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Verify food item details
        let getItemBlock = chain.mineBlock([
            Tx.contractCall('food-tracker', 'get-food-item', [
                types.uint(1)
            ], deployer.address)
        ]);
        
        const item = getItemBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(item['producer'], deployer.address);
        assertEquals(item['product-name'], "Organic Apples");
        assertEquals(item['status'], "produced");
    }
});

Clarinet.test({
    name: "Can update food item status",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // First register an item
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii("Organic Apples"),
                types.ascii("Farm A, California")
            ], deployer.address)
        ]);
        
        // Update status
        let updateBlock = chain.mineBlock([
            Tx.contractCall('food-tracker', 'update-status', [
                types.uint(1),
                types.ascii("in_transit"),
                types.ascii("Distribution Center B")
            ], deployer.address)
        ]);
        
        updateBlock.receipts[0].result.expectOk().expectBool(true);
    }
});
