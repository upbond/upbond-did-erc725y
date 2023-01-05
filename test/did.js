const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { randomBytes } = require('crypto');
const { network, ethers } = require("hardhat");

async function deployDID() {
  const [owner, otherAccount] = await ethers.getSigners();
  const generate32 = `0x${randomBytes(32).toString('hex')}`;
  const generate32again = `0x${randomBytes(32).toString('hex')}`;
  const generate64 = `0x${randomBytes(64).toString('hex')}`;
  const generate64again = `0x${randomBytes(64).toString('hex')}`;
  const generate4 = `0x${randomBytes(4).toString('hex')}`;

  const UpbondDID = await hre.ethers.getContractFactory("UpbondDID");
  const upbondDID = await UpbondDID.deploy();
  await upbondDID.deployed();

  const UpbondDIDFactory = await hre.ethers.getContractFactory("UpbondDIDFactory");
  const upbondDIDFactory = await UpbondDIDFactory.deploy(upbondDID.address);
  await upbondDIDFactory.deployed();

  return { upbondDIDFactory, owner, otherAccount, generate4, generate32, generate32again, generate64, generate64again };
}

async function remoteDID(address) {
  const UpbondDID = await hre.ethers.getContractFactory("UpbondDID");
  const upbondDID = await UpbondDID.attach(address);

  return upbondDID;
}

async function getSignature(signer, contractaddress, permittedaddress, key, deadline) {
  const domain = {
    name: "Upbond DID",
    version: "1",
    chainId: network.config.chainId,
    verifyingContract: contractaddress,
  };
  const getDataWithPermit = [
    { name: "permitted", type: "address" },
    { name: "dataKey", type: "bytes32" },
    { name: "deadline", type: "uint256" },
  ];
  const types = { getDataWithPermit };
  const message = {
    permitted: permittedaddress,
    dataKey: key,
    deadline: parseInt(deadline),
  };

  // console.log(domain,
  //     types,
  //     message)

  const signature = await signer._signTypedData(
    domain,
    types,
    message
  );

  const v = "0x" + signature.slice(130, 132);
  const r = signature.slice(0, 66);
  const s = "0x" + signature.slice(66, 130);

  return {v, r, s};
}

function addHours(date, hours) {
  date.setHours(date.getHours() + hours);

  return date;
}

describe("Upbond DID", function() {
  describe("Deployment", function () {
    it("Should success call `totalDID` is have zero DID", async function () {
      const { upbondDIDFactory } = await loadFixture(deployDID);

      expect(await upbondDIDFactory.totalDID()).to.equal(0);
    });
    it("Should success call `owner`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);

      expect(await upbondDIDFactory.owner()).to.equal(owner.address);
    });
  });
  describe("Create DID", function () {
    it("Should success call `createDID`", async function () {
      const { upbondDIDFactory } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);
    });
    it("Should success call `createDIDForUser`", async function () {
      const { upbondDIDFactory, otherAccount } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDIDForUser(otherAccount.address);
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);
    });
    it("Should error if call `createDID` again with same wallet", async function () {
      const { upbondDIDFactory } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);
      await expect(upbondDIDFactory.createDID()).to.be.revertedWith(
        "UpbondDIDFactory : You`re already created DID!"
      );
    });
    it("Should error if call `createDIDForUser` again with same wallet", async function () {
      const { upbondDIDFactory, otherAccount } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDIDForUser(otherAccount.address);
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);
      await expect(upbondDIDFactory.createDIDForUser(otherAccount.address)).to.be.revertedWith(
        "UpbondDIDFactory : User already have DID!"
      );
    });
    it("Should error if call `createDIDForUser` if not owner", async function () {
      const { upbondDIDFactory, otherAccount } = await loadFixture(deployDID);
      
      await expect(upbondDIDFactory.connect(otherAccount).createDIDForUser(otherAccount.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
  describe("Control DID", function () {
    it("Should success call `factory`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.factory()).to.equal(upbondDIDFactory.address);
    });
    it("Should success call `owner`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.owner()).to.equal(owner.address);
    });
    it("Should success call `supportsInterface`", async function () {
      const { upbondDIDFactory, owner, generate4 } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.supportsInterface(generate4)).to.equal(false);
    });
    it("Should success call `toBytes`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.toBytes(owner.address)).to.equal("0x307866333946643665353161616438384636463463653661423838323732373963666646623932323636");
    });
    it("Should success call `toBytes32`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.toBytes32(owner.address)).to.equal("0x3078663339466436653531616164383846364634636536614238383237323739");
    });
    it("Should success call `fromBytes`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.fromBytes("0x307866333946643665353161616438384636463463653661423838323732373963666646623932323636")).to.equal(owner.address);
    });
    it("Should success call `fromBytes32`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      expect(await upbondDID.fromBytes("0x3078663339466436653531616164383846364634636536614238383237323739")).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279");
    });
    it("Should success call `setData` with single key and single value", async function () {
      const { upbondDIDFactory, owner, generate32, generate64 } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32,bytes)'](generate32,generate64);
      await txSet.wait();
    });
    it("Should success call `setData` with multiple key and multiple value", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();
    });
    it("Should success call `getDataWithPermit` with single key", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const { v, r, s } = await getSignature(owner, didAddr, owner.address, generate32, deadline);
      // console.log(v, r, s)

      expect(await upbondDID.functions['getDataWithPermit(address,bytes32,uint256,uint8,bytes32,bytes32)'](owner.address, generate32, deadline, v, r, s)).to.deep.equal([generate64]);
    });
    it("Should success call `getDataWithPermit` with multi key", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const encoder = new ethers.utils.AbiCoder();
      const multikey = ethers.utils.keccak256(encoder.encode(["bytes32[]"], [[generate32, generate32again]]));
      // console.log(multikey)

      const { v, r, s } = await getSignature(owner, didAddr, owner.address, multikey, deadline);
      // console.log(v, r, s)

      expect(await upbondDID.functions['getDataWithPermit(address,bytes32[],uint256,uint8,bytes32,bytes32)'](owner.address, [generate32, generate32again], deadline, v, r, s)).to.deep.equal([[generate64, generate64again]]);
    });
    it("Should error call `transferOwnership`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      await expect(upbondDID.transferOwnership(owner.address)).to.be.revertedWith(
        "UpbondDID : This function is overridden, ownable is not transferable!"
      );
    });
    it("Should error call `renounceOwnership`", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      await expect(upbondDID.renounceOwnership()).to.be.revertedWith(
        "UpbondDID : This function is overridden, ownable is not transferable!"
      );
    });
    it("Should error call `initialize` after create DID", async function () {
      const { upbondDIDFactory, owner } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      await expect(upbondDID.initialize(owner.address)).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
    it("Should error call `getData` with single key", async function () {
      const { upbondDIDFactory, owner, generate32 } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      await expect(upbondDID.functions['getData(bytes32)'](generate32)).to.be.revertedWith(
        "UpbondDID : This function is overridden, use `getDataWithPermit` function!"
      );
    });
    it("Should error call `getData` with multikey key", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      await expect(upbondDID.functions['getData(bytes32[])']([generate32, generate32again])).to.be.revertedWith(
        "UpbondDID : This function is overridden, use `getDataWithPermit` function!"
      );
    });
    it("Should error call `setData` with used single key", async function () {
      const { upbondDIDFactory, owner, generate32, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32,bytes)'](generate32,generate64);
      await txSet.wait();

      await expect(upbondDID.functions['setData(bytes32,bytes)'](generate32,generate64again)).to.be.revertedWith(
        "UpbondDID : This key already set!"
      );
    });
    it("Should error call `setData` with used multiple key", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      await expect(upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again])).to.be.revertedWith(
        "UpbondDID : This key already set!"
      );
    });
    it("Should error call `getDataWithPermit` with single key and invalid signature", async function () {
      const { upbondDIDFactory, owner, otherAccount, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const { v, r, s } = await getSignature(otherAccount, didAddr, owner.address, generate32, deadline);
      // console.log(v, r, s)

      await expect(upbondDID.functions['getDataWithPermit(address,bytes32,uint256,uint8,bytes32,bytes32)'](owner.address, generate32, deadline, v, r, s)).to.be.revertedWith(
        "UpbondDID: invalid signature"
      );
    });
    it("Should error call `getDataWithPermit` with multi key and invalid signature", async function () {
      const { upbondDIDFactory, owner, otherAccount, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const encoder = new ethers.utils.AbiCoder();
      const multikey = ethers.utils.keccak256(encoder.encode(["bytes32[]"], [[generate32, generate32again]]));
      // console.log(multikey)

      const { v, r, s } = await getSignature(otherAccount, didAddr, owner.address, multikey, deadline);
      // console.log(v, r, s)

      await expect(upbondDID.functions['getDataWithPermit(address,bytes32[],uint256,uint8,bytes32,bytes32)'](owner.address, [generate32, generate32again], deadline, v, r, s)).to.be.revertedWith(
        "UpbondDID: invalid signature"
      );
    });
    it("Should error call `getDataWithPermit` with single key and expired deadline", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const { v, r, s } = await getSignature(owner, didAddr, owner.address, generate32, deadline);
      // console.log(v, r, s)

      await time.increase(86400);

      await expect(upbondDID.functions['getDataWithPermit(address,bytes32,uint256,uint8,bytes32,bytes32)'](owner.address, generate32, deadline, v, r, s)).to.be.revertedWith(
        "UpbondDID: expired deadline"
      );
    });
    it("Should error call `getDataWithPermit` with multi key and expired deadline", async function () {
      const { upbondDIDFactory, owner, generate32, generate32again, generate64, generate64again } = await loadFixture(deployDID);
      
      const tx = await upbondDIDFactory.createDID();
      await tx.wait();

      expect(await upbondDIDFactory.totalDID()).to.equal(1);

      const didAddr = await upbondDIDFactory.userDIDs(owner.address);
      const upbondDID = await remoteDID(didAddr);

      const txSet = await upbondDID.functions['setData(bytes32[],bytes[])']([generate32, generate32again],[generate64, generate64again]);
      await txSet.wait();

      const current = new Date();
      const deadline = Math.ceil(addHours(current, 1).getTime() / 1000);
      // console.log(deadline)

      const encoder = new ethers.utils.AbiCoder();
      const multikey = ethers.utils.keccak256(encoder.encode(["bytes32[]"], [[generate32, generate32again]]));
      // console.log(multikey)

      const { v, r, s } = await getSignature(owner, didAddr, owner.address, multikey, deadline);
      // console.log(v, r, s)

      await time.increase(86400);

      await expect(upbondDID.functions['getDataWithPermit(address,bytes32[],uint256,uint8,bytes32,bytes32)'](owner.address, [generate32, generate32again], deadline, v, r, s)).to.be.revertedWith(
        "UpbondDID: expired deadline"
      );
    });
  });
});