const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 17 de Junio del 2023 GMT
var startDate = 1686960000;

var makeBN = (num) => ethers.BigNumber.from(String(num));

describe("MI PRIMER TOKEN TESTING", function () {
  var nftContract, publicSale, miPrimerToken, usdc;
  var owner, gnosis, alice, bob, carl, deysi;
  var name = "Mi Primer NFT";
  var symbol = "MPRNFT";

  before(async () => {
    [owner, gnosis, alice, bob, carl, deysi] = await ethers.getSigners();
  });

  // Estos dos métodos a continuación publican los contratos en cada red
  // Se usan en distintos tests de manera independiente
  // Ver ejemplo de como instanciar los contratos en deploy.js
  async function deployNftSC() {
    nftContract = await deploySC("PC3NFTUpgradeable",[]);
    await ex(nftContract, "grantRole", [MINTER_ROLE, relayer.address], "GR");
  }

  async function deployPublicSaleSC() {
    miPrimerToken = await deploySC("PC3TokenUpgradeable",[]);
    publicSale = await deploySC("PublicSale",[]);
    await ex(publicSale, "setPC3Token", [miPrimerToken.address], "SPC3");
    await ex(publicSale, "setGnosisWallet", [gnosis.address], "SGW");
    await ex(publicSale, "setNumberNFTs", [30], "SetUp Number NFTs");
    await ex(miPrimerToken, "mint", [bob.address, cienmilTokens], "TKN Mint");
  }

  describe("Mi Primer Nft Smart Contract", () => {
    // Se publica el contrato antes de cada test
    beforeEach(async () => {
      await deployNftSC();
    });

    it("Verifica nombre colección", async () => {
      expect(await nftContract.name()).to.be.equal(name);
    });

    it("Verifica símbolo de colección", async () => {
      expect(await nftContract.symbol()).to.be.equal(symbol);
    });

    it("No permite acuñar sin privilegio", async () => {
      var mensajeError = "AccessControl: account " + bob.address.toLowerCase() + " is missing role " + MINTER_ROLE;
      await expect(nftContract.connect(bob).safeMint(bob.address,1)).to.be.revertedWith(mensajeError);
    });

    it("No permite acuñar doble id de Nft", async () => {
      await nftContract.connect(relayer).safeMint(bob.address,1);
      await expect(nftContract.connect(relayer).safeMint(bob.address,1)).to.be.revertedWith("ERC721: token already minted");
    });

    it("Verifica rango de Nft: [1, 30]", async () => {
      // Mensaje error: "NFT: Token id out of range"
      await expect(nftContract.connect(relayer).safeMint(bob.address,31)).to.be.revertedWith("NFT: Token id out of range");
    });

    it("Se pueden acuñar todos (30) los Nfts", async () => {
      for(var i=0; i<30; i++){
        expect(await nftContract.connect(relayer).safeMint(bob.address,i)).to.be.ok;
      }
    });
  });

  describe("Public Sale Smart Contract", () => {
    // Se publica el contrato antes de cada test
    beforeEach(async () => {
      await deployPublicSaleSC();
    });

    it("No se puede comprar otra vez el mismo ID", async () => {});

    it("IDs aceptables: [1, 30]", async () => {});

    it("Usuario no dio permiso de MiPrimerToken a Public Sale", async () => {});

    it("Usuario no tiene suficientes MiPrimerToken para comprar", async () => {});

    describe("Compra grupo 1 de NFT: 1 - 10", () => {
      it("Emite evento luego de comprar", async () => {
        // modelo para validar si evento se disparo con correctos argumentos
        // var tx = await publicSale.purchaseNftById(id);
        // await expect(tx)
        //   .to.emit(publicSale, "DeliverNft")
        //   .withArgs(owner.address, counter);
      });

      it("Disminuye balance de MiPrimerToken luego de compra", async () => {
        // Usar changeTokenBalance
        // source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#change-token-balance
      });

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {});

      it("Smart contract recibe neto (90%) luego de compra", async () => {});
    });

    describe("Compra grupo 2 de NFT: 11 - 20", () => {
      it("Emite evento luego de comprar", async () => {});

      it("Disminuye balance de MiPrimerToken luego de compra", async () => {});

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {});

      it("Smart contract recibe neto (90%) luego de compra", async () => {});
    });

    describe("Compra grupo 3 de NFT: 21 - 30", () => {
      it("Disminuye balance de MiPrimerToken luego de compra", async () => {});

      it("Gnosis safe recibe comisión del 10% luego de compra", async () => {});

      it("Smart contract recibe neto (90%) luego de compra", async () => {});
    });

    describe("Depositando Ether para Random NFT", () => {
      it("Método emite evento (30 veces) ", async () => {});

      it("Método falla la vez 31", async () => {});

      it("Envío de Ether y emite Evento (30 veces)", async () => {});

      it("Envío de Ether falla la vez 31", async () => {});

      it("Da vuelto cuando y gnosis recibe Ether", async () => {
        // Usar el método changeEtherBalances
        // Source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#change-ether-balance-multiple-accounts
        // Ejemplo:
        // await expect(
        //   await owner.sendTransaction({
        //     to: publicSale.address,
        //     value: pEth("0.02"),
        //   })
        // ).to.changeEtherBalances(
        //   [owner.address, gnosis.address],
        //   [pEth("-0.01"), pEth("0.01")]
        // );
      });
    });
  });
});
