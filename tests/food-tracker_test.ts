import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can register new food item with certifications",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii("Organic Apples"),
                types.ascii("Farm A, California"),
                types.list([types.ascii("Organic"), types.ascii("Non-GMO")])
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        let getItemBlock = chain.mineBlock([
            Tx.contractCall('food-tracker', 'get-food-item', [
                types.uint(1)
            ], deployer.address)
        ]);
        
        const item = getItemBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(item['producer'], deployer.address);
        assertEquals(item['product-name'], "Organic Apples");
        assertEquals(item['certifications'].length, 2);
    }
});

Clarinet.test({
    name: "Can add certification authority",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const authority = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('food-tracker', 'add-certification-authority', [
                types.principal(authority.address),
                types.ascii("USDA Organic")
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        let getAuthorityBlock = chain.mineBlock([
            Tx.contractCall('food-tracker', 'get-certification-authority', [
                types.principal(authority.address)
            ], deployer.address)
        ]);
        
        const authorityInfo = getAuthorityBlock.receipts[0].result.expectOk().expectSome();
        assertEquals(authorityInfo['name'], "USDA Organic");
        assertEquals(authorityInfo['active'], true);
    }
});

Clarinet.test({
    name: "Certification authority can add certification to food item",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const authority = accounts.get('wallet_1')!;
        
        // Register authority
        chain.mineBlock([
            Tx.contractCall('food-tracker', 'add-certification-authority', [
                types.principal(authority.address),
                types.ascii("USDA Organic")
            ], deployer.address)
        ]);
        
        // Register food item
        chain.mineBlock([
            Tx.contractCall('food-tracker', 'register-food-item', [
                types.ascii("Organic Apples"),
                types.ascii("Farm A, California"),
                types.list([])
            ], deployer.address)
        ]);
        
        // Add certification
        let certBlock = chain.mineBlock([
            Tx.contractCall('food-tracker', 'add-certification', [
                types.uint(1),
                types.ascii("USDA Organic Certified")
            ], authority.address)
        ]);
        
        certBlock.receipts[0].result.expectOk().expectBool(true);
    }
});
