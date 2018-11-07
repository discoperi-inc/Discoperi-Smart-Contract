const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');
const { advanceBlock } = require('./helpers/advanceToBlock');
const { increaseTimeTo } = require('./helpers/increaseTime');
const { duration } = require('./helpers/increaseTime');
const { latestTime } = require('./helpers/latestTime');

const setup = require('./helpers/setup');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

  contract('DiscoperiToken - init', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
        
    });    

    beforeEach(async () => {
        await setup(accounts, env).should.be.fulfilled;
    });
  
        it('should set correct data in init', async() => {
            const saleExpected = env.sale.address;

            const teamRelease = (await latestTime()) + duration.years(1);
            const vestingFirstReleaseExpected = (await latestTime()) + duration.weeks(3);
            const vestingSecondReleaseExpected = (await latestTime()) + duration.weeks(6); 
            const vestingThirdReleaseExpected = (await latestTime()) + duration.weeks(9);
            const vestingFourthReleaseExpected = (await latestTime()) + duration.weeks(12);

            await env.token.init(
                saleExpected,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.fulfilled;

            const saleActual = await env.token.sale();

            const saleSupply = await env.token.SALES_SUPPLY();
            const refSupply = await env.token.REFERRAL_SUPPLY();

            const saleBalanceExpected = saleSupply.add(refSupply);
            const saleBalanceActual = await env.token.balanceOf(env.sale.address);
            
            const vestingFirstReleaseActual =  await env.token.vestingReleases(0);
            const vestingSecondReleaseActual =  await env.token.vestingReleases(1); 
            const vestingThirdReleaseActual =  await env.token.vestingReleases(2);
            const vestingFourthReleaseActual =  await env.token.vestingReleases(3);

            saleActual.should.be.equal(saleExpected);
            saleBalanceActual.should.bignumber.be.equal(saleBalanceExpected);

            vestingFirstReleaseActual.should.bignumber.be.equal(vestingFirstReleaseExpected);
            vestingSecondReleaseActual.should.bignumber.be.equal(vestingSecondReleaseExpected);
            vestingThirdReleaseActual.should.bignumber.be.equal(vestingThirdReleaseExpected);
            vestingFourthReleaseActual.should.bignumber.be.equal(vestingFourthReleaseExpected);
        });
        
        it('should not set sale contracts as zero address', async() => {
            const teamRelease = (await latestTime()) + duration.years(1);
            const vestingFirstReleaseExpected = (await latestTime()) + duration.weeks(3);
            const vestingSecondReleaseExpected = (await latestTime()) + duration.weeks(6); 
            const vestingThirdReleaseExpected = (await latestTime()) + duration.weeks(9);
            const vestingFourthReleaseExpected = (await latestTime()) + duration.weeks(12);

            await env.token.init(
                zeroAddress,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);
        });    

        it('should not init contract twice', async() => {  
            const teamRelease = (await latestTime()) + duration.years(1);
            const vestingFirstReleaseExpected = (await latestTime()) + duration.weeks(3);
            const vestingSecondReleaseExpected = (await latestTime()) + duration.weeks(6); 
            const vestingThirdReleaseExpected = (await latestTime()) + duration.weeks(9);
            const vestingFourthReleaseExpected = (await latestTime()) + duration.weeks(12);

            await env.token.init(
                env.sale.address,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.fulfilled;

            await env.token.init(
                env.sale.address,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);
        });    
        
        it('should not init contract with incorrect release dates', async() => {  
            const teamRelease = (await latestTime()) + duration.years(1);
            const vestingFirstReleaseExpected = (await latestTime()) + duration.weeks(3);
            const vestingSecondReleaseExpected = (await latestTime()) + duration.weeks(6); 
            const vestingThirdReleaseExpected = (await latestTime()) + duration.weeks(9);
            const vestingFourthReleaseExpected = (await latestTime()) + duration.weeks(12);

            await env.token.init(
                env.sale.address,
                0,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);

            await env.token.init(
                env.sale.address,
                teamRelease,
                0,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);

            await env.token.init(
                env.sale.address,
                teamRelease,
                vestingFirstReleaseExpected,
                0,
                vestingThirdReleaseExpected,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);

            await env.token.init(
                env.sale.address,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                0,
                vestingFourthReleaseExpected 
            ).should.be.rejectedWith(EVMRevert);

            await env.token.init(
                env.sale.address,
                teamRelease,
                vestingFirstReleaseExpected,
                vestingSecondReleaseExpected,
                vestingThirdReleaseExpected,
                0 
            ).should.be.rejectedWith(EVMRevert);
        });

});

contract('DiscoperiToken', (accounts) => {

    let env = {};
    let sale = accounts[1];

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
        
    });    

    beforeEach(async () => {
        await setup(accounts, env).should.be.fulfilled;
 
        const teamRelease = (await latestTime()) + duration.years(1);
        const vestingFirstRelease = (await latestTime()) + duration.weeks(3);
        const vestingSecondRelease = (await latestTime()) + duration.weeks(6); 
        const vestingThirdRelease = (await latestTime()) + duration.weeks(9);
        const vestingFourthRelease =(await latestTime()) + duration.weeks(12);

        await env.token.init(
            sale,
            teamRelease,
            vestingFirstRelease,
            vestingSecondRelease,
            vestingThirdRelease,
            vestingFourthRelease 
        ).should.be.fulfilled;
    });
  

    describe('sales', function () {
           
        it('should burn sale tokens', async() => {
            const saleSupply = await env.token.SALES_SUPPLY();
            const refSupply = await env.token.REFERRAL_SUPPLY();
            const startBalanceExpected = saleSupply.add(refSupply);
            const endBalanceExpected = 0;

            const startBalanceActual = await env.token.balanceOf(sale);
            await env.token.burnSaleTokens({ from: sale}).should.be.fulfilled;
            const endBalanceActual = await env.token.balanceOf(sale);

            startBalanceExpected.should.be.bignumber.equal(startBalanceActual);
            endBalanceExpected.should.be.bignumber.equal(endBalanceActual);
        });    

        it('should not be able to burn sale tokens from arbitrary address', async() => {
            const arbitraryAddress = accounts[4];
            await env.token.burnSaleTokens({ from: arbitraryAddress}).should.be.rejectedWith(EVMRevert);
        });    

    });

    describe('vesting', function () {     
        it('should be able to transfer tokens with transferWithVesting function', async() => {
            const to = accounts[2];
            const tokens = 1000;
    
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;

            const balance = await env.token.balanceOf(to); 
            balance.should.be.bignumber.equal(tokens);
        });  
    
        it('should not be able to call transferWithVesting from the arbitrary address', async() => {
            const from = accounts[2];
            const to = accounts[3];
            const tokens = 1000;

            await env.token.transferWithVesting(to, tokens, { from: from }).should.be.rejectedWith(EVMRevert);
        });

        it('should vest tokens', async() => {
            const to = accounts[2];
            const tokens = 100;
            
            const startHasVested = await env.token.hasVested(to); 

            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;
            const endHasVested = await env.token.hasVested(to);
            
            startHasVested.should.be.equal(false);
            endHasVested.should.be.equal(true);
        });  
        
        it('should be able to get count of vested amounts', async() => {
            const to = accounts[2];
            const tokens = 100;
            
            const startVestedAmount = await env.token.vestedAmount(to);    

            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;
            const endVestedAmount = await env.token.vestedAmount(to); 
            
            startVestedAmount.should.be.bignumber.equal(new BigNumber(0));
            endVestedAmount.should.be.bignumber.equal(new BigNumber(tokens));
        });        
        
        it('should free vested amount by portions of 25%', async() => {
            const to = accounts[2];
            const tokens = 100;
            const tokensPortion = tokens / 4;

            const vestingReleases = new Array(
                await env.token.vestingReleases(0),
                await env.token.vestingReleases(1),
                await env.token.vestingReleases(2),
                await env.token.vestingReleases(3),
            );
            
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;
            
            const startBalanceSpotExpected = new BigNumber(0);
            const startBalanceSpotActual = await env.token.balanceSpot(to);  

            const startBalanceVestedExpected = tokens; 
            const startBalanceVestedActual = await env.token.balanceVested(to);

            await increaseTimeTo(vestingReleases[0]);
            
            const firstReleaseBalanceSpotExpected = new BigNumber(tokensPortion);
            const firstReleaseBalanceSpotActual = await env.token.balanceSpot(to);  

            const firstReleaseBalanceVestedExpected = new BigNumber(tokensPortion).mul(3); 
            const firstReleaseBalanceVestedActual = await env.token.balanceVested(to);

            await increaseTimeTo(vestingReleases[1]);
            
            const secondReleaseBalanceSpotExpected = new BigNumber(tokensPortion).mul(2);
            const secondReleaseBalanceSpotActual = await env.token.balanceSpot(to);  

            const secondReleaseBalanceVestedExpected = new BigNumber(tokensPortion).mul(2); 
            const secondReleaseBalanceVestedActual = await env.token.balanceVested(to);

            await increaseTimeTo(vestingReleases[2]);
            
            const thirdhReleaseBalanceSpotExpected = new BigNumber(tokensPortion).mul(3);
            const thirdhReleaseBalanceSpotActual = await env.token.balanceSpot(to);  

            const thirdhReleaseBalanceVestedExpected = new BigNumber(tokensPortion); 
            const thirdhReleaseBalanceVestedActual = await env.token.balanceVested(to);

            await increaseTimeTo(vestingReleases[3]);
            
            const fourthReleaseBalanceSpotExpected = new BigNumber(tokens);
            const fourthReleaseBalanceSpotActual = await env.token.balanceSpot(to);  

            const fourthReleaseBalanceVestedExpected = new BigNumber(0); 
            const fourthReleaseBalanceVestedActual = await env.token.balanceVested(to);

            startBalanceSpotExpected.should.be.bignumber.equal(startBalanceSpotActual);
            startBalanceVestedExpected.should.be.bignumber.equal(startBalanceVestedActual);
            
            firstReleaseBalanceSpotExpected.should.be.bignumber.equal(firstReleaseBalanceSpotActual);
            firstReleaseBalanceVestedExpected.should.be.bignumber.equal(firstReleaseBalanceVestedActual);
            
            secondReleaseBalanceSpotExpected.should.be.bignumber.equal(secondReleaseBalanceSpotActual);
            secondReleaseBalanceVestedExpected.should.be.bignumber.equal(secondReleaseBalanceVestedActual);
            
            thirdhReleaseBalanceSpotExpected.should.be.bignumber.equal(thirdhReleaseBalanceSpotActual);
            thirdhReleaseBalanceVestedExpected.should.be.bignumber.equal(thirdhReleaseBalanceVestedActual);
            
            fourthReleaseBalanceSpotExpected.should.be.bignumber.equal(fourthReleaseBalanceSpotActual);
            fourthReleaseBalanceVestedExpected.should.be.bignumber.equal(fourthReleaseBalanceVestedActual);

            const endHasVested = await env.token.hasVested(to);
            
            endHasVested.should.be.equal(false);
        });        
        
        
        it('should not be able to transfer tokens with transferWithVesting function to zero address', async() => {
            const to = zeroAddress;
            const tokens = 1000;
    
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.rejectedWith(EVMRevert);
        });
    
        it('should not be able to transfer zero amount of tokens with vesting ', async() => {
            const to = accounts[2];
            const tokens = 0;
    
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.rejectedWith(EVMRevert);
        });    

    });

    
    describe('locking', function () {   

        it('should be able to transfer tokens with transferWithLockup function', async() => {
            const to = accounts[2];
            const tokens = 1000;
            const release = (await latestTime()) + duration.days(3);
    
            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;

            const balance = await env.token.balanceOf(to); 
            balance.should.be.bignumber.equal(tokens);
        });  
    
        it('should not be able to call transferWithLockup from the arbitrary address', async() => {
            const from = accounts[2];
            const to = accounts[3];
            const tokens = 1000;
            const release = (await latestTime()) + duration.days(3);

            await env.token.transferWithLockup(to, tokens, release, { from: from }).should.be.rejectedWith(EVMRevert);
        });

        it('should lock tokens', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = (await latestTime()) + duration.days(3);
            
            const startHasLockedUp = await env.token.hasLockedUp(to); 

            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;
            const endHasLockedUp = await env.token.hasLockedUp(to);
            
            startHasLockedUp.should.be.equal(false);
            endHasLockedUp.should.be.equal(true);
        });  

        it('should do not lock tokens if release time = 0', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = 0;
            
            const startHasLockedUp = await env.token.hasLockedUp(to); 

            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;
            const endHasLockedUp = await env.token.hasLockedUp(to);
            
            startHasLockedUp.should.be.equal(false);
            endHasLockedUp.should.be.equal(false);
        });  
        
        it('should be able to get count of locked amounts', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = (await latestTime()) + duration.days(3);
            
            const startLockedUpAmount = await env.token.balanceLockedUp(to);    

            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;
            const endLockedUpAmount = await env.token.balanceLockedUp(to); 
            
            startLockedUpAmount.should.be.bignumber.equal(new BigNumber(0));
            endLockedUpAmount.should.be.bignumber.equal(new BigNumber(tokens));
        });        
        
        it('should not be able to transfer lockedup amount before release timestamp', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = (await latestTime()) + duration.days(3);
            
            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;
            await env.token.transfer(sale, tokens, { from: to }).should.be.rejectedWith(EVMRevert);
            const balance = await env.token.balanceOf(to);
            
            balance.should.be.bignumber.equal(tokens);
        });  
        
        it('should not be able to lock up tokens to zero address', async() => {
            const tokens = 100;
            const release = (await latestTime()) + duration.days(3);
            
            await env.token.transferWithLockup(zeroAddress, tokens, release, { from: sale }).should.be.rejectedWith(EVMRevert);
        }); 

        it('should not be able to lock up zero amount of tokens', async() => {
            const to = accounts[2];
            const tokens = 0;
            const release = (await latestTime()) + duration.days(3);
            
            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.rejectedWith(EVMRevert);
        }); 

        it('should not be able to lock up tokens with release time in past', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = (await latestTime()) - duration.days(3);
            
            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.rejectedWith(EVMRevert);
        }); 

        it('should free lockedup amount after release timestamp', async() => {
            const to = accounts[2];
            const tokens = 100;
            const release = (await latestTime()) + duration.days(3);
            
            await env.token.transferWithLockup(to, tokens, release, { from: sale }).should.be.fulfilled;
            await increaseTimeTo(release);

            const endHasLockedUp = await env.token.hasLockedUp(to);
            
            endHasLockedUp.should.be.equal(false);
        });  
       
    });


    describe('balance', function () {
        it('should be able to transfer or transferFrom balance spot', async() => {
            const to = accounts[2];
            const pool = accounts[3];
            const tokens = 100;
            
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;
            await env.token.transferWithVesting(pool, tokens, { from: sale }).should.be.fulfilled;
            
            const balanceSpot = await env.token.balanceSpot(to);

            await env.token.transfer(pool, balanceSpot, { from: to }).should.be.fulfilled;
            await env.token.approve(to, tokens, { from: pool }).should.be.fulfilled;
            await env.token.transferFrom(pool, to, balanceSpot, { from: to }).should.be.fulfilled;
        }); 
         
        it('should not be able to transfer or transferFrom more than balance spot', async() => {
            const to = accounts[2];
            const pool = accounts[3];
            const tokens = 100;
            
            await env.token.transferWithVesting(to, tokens, { from: sale }).should.be.fulfilled;
            await env.token.transferWithVesting(pool, tokens, { from: sale }).should.be.fulfilled;
            
            const balanceSpot = await env.token.balanceSpot(to);

            await env.token.transfer(pool, balanceSpot + 1, { from: to }).should.be.rejectedWith(EVMRevert);
            await env.token.approve(to, tokens, { from: pool }).should.be.fulfilled;
            await env.token.transferFrom(pool, to, balanceSpot + 1, { from: to }).should.be.rejectedWith(EVMRevert);
        }); 
    });

});
