'use strict'

const tileContract = `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./Types.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface ITileContract {
    function tileEmoji(Coords memory coords) external view returns (string memory);

    function tileName(Coords memory coords) external view returns (string memory);

    function tileDescription(Coords memory coords) external view returns (string memory);

    function tileABI(Coords memory coords) external view returns (string memory);
}


abstract contract TinyERC20 is ERC20Burnable, ITileContract {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC20(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function isContract(address addr) internal view returns (bool) {
        return addr.code.length > 0;
    }

    function getAddressOrContractLocations(address addr) internal view returns (Coords[] memory) {
        if (isContract(addr)) {
            return connectedWorld.getContractLocations(addr);
        } else {
            require(connectedWorld.playerInited(addr), "addr is not an exgrasia player");
            Coords[] memory ret = new Coords[](1);
            ret[0] = connectedWorld.getPlayerLocation(addr);
            return ret;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        Coords[] memory fromLocations = getAddressOrContractLocations(from);
        Coords[] memory toLocations = getAddressOrContractLocations(to);
        bool satisfactory = false;
        for (uint256 i = 0; i < fromLocations.length; i++) {
            for (uint256 j = 0; j < toLocations.length; j++) {
                if (connectedWorld.dist(fromLocations[i], toLocations[j]) <= 1) {
                    satisfactory = true;
                    break;
                }
            }
            if (satisfactory) break;
        }
        require(satisfactory, "Transfer is only allowed between adjacent tiles");
    }

    function mint(address to, uint256 count) public virtual;

    function approveAll(address aprovee) public {
        super.approve(aprovee, 2**250);
    }

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"💰";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return string(abi.encodePacked("Stack of ", ERC20.name(), " (", ERC20.symbol(), ")"));
    }

    function tileDescription(Coords memory coords) external view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "This is a stack of ",
                    ERC20.name(),
                    " (",
                    ERC20.symbol(),
                    "). You can use this to manage and authorise access to your tokens for different contracts."
                )
            );
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/ea69052ba9c70f6574ba5d19c29193b1fa183c61/TinyERC20.json";
    }
}

abstract contract TinyERC721 is ERC721Enumerable {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC721(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function isContract(address addr) internal view returns (bool) {
        return addr.code.length > 0;
    }

    function getAddressOrContractLocations(address addr) internal view returns (Coords[] memory) {
        if (isContract(addr)) {
            return connectedWorld.getContractLocations(addr);
        } else {
            require(connectedWorld.playerInited(addr), "addr is not an exgrasia player");
            Coords[] memory ret = new Coords[](1);
            ret[0] = connectedWorld.getPlayerLocation(addr);
            return ret;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        Coords[] memory fromLocations = getAddressOrContractLocations(from);
        Coords[] memory toLocations = getAddressOrContractLocations(to);
        bool satisfactory = false;
        for (uint256 i = 0; i < fromLocations.length; i++) {
            for (uint256 j = 0; j < toLocations.length; j++) {
                if (connectedWorld.dist(fromLocations[i], toLocations[j]) <= 1) {
                    satisfactory = true;
                    break;
                }
            }
            if (satisfactory) break;
        }
        require(satisfactory, "Transfer is only allowed between adjacent tiles");
    }
}`

const myTileContract = `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./TinyWorldRegistry.sol";
import "./TileContract.sol";

contract CampFire is ITileContract {
    TinyWorld connectedWorld = TinyWorld(0x0583f380BDa6C1b97029BF1a95C757329b5Ba3B3);

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"🏕️";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Campfire";
    }

    function tileDescription(Coords memory coords)
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "Chat with others here. Anyone can read your messages but you need to be next to a campfire to send one!";
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        // Autogenerated - DO NOT EDIT
        return "https://exgrasia.infura-ipfs.io/ipfs/AUTOGEN";
    }
}`

const tinyWorld = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Types.sol";

interface TinyWorld {
    function addWhitelistedContracts ( address[] memory smartContracts ) external;
    function cachedTiles ( uint256, uint256 ) external view returns ( Coords memory coords, uint256 raritySeed, uint8 tileType, uint8 temperatureType, uint8 altitudeType, address owner, address smartContract, uint256 lastPurchased );
    function canMoveSnow ( address ) external view returns ( bool );
    function canMoveWater ( address ) external view returns ( bool );
    function canPutAnything ( address ) external view returns ( bool );
    function dist ( Coords memory a, Coords memory b ) external pure returns ( uint256 );
    function forceTileUpdate ( Coords memory coords ) external;
    function getCachedTile ( Coords memory coords ) external view returns ( Coords memory );
    function getContractLocations ( address contractAddress ) external view returns ( Coords[] memory );
    function getPlayerIds (  ) external view returns ( address[] memory );
    function getPlayerInfos (  ) external view returns ( Coords[] memory, string[] memory, bool[] memory, bool[] memory, bool[] memory );
    function getPlayerLocation ( address player ) external view returns ( Coords memory );
    function getTile ( Coords memory coords ) external returns ( Coords memory );
    function getTouchedTiles (  ) external view returns ( Coords[] memory );
    function initPlayerLocation ( string memory repr ) external;
    function initialize ( uint256 _seed, uint256 _worldWidth, uint256 _worldScale, address _registryAddress, address[] memory _admins ) external;
    function isAdmin ( address ) external view returns ( bool );
    function movePlayer ( Coords memory coords ) external;
    function ownTile ( Coords memory coords, address smartContract ) external;
    function owner (  ) external view returns ( address );
    function perlinMax (  ) external view returns ( uint16 );
    function playerEmoji ( address ) external view returns ( string memory );
    function playerIds ( uint256 ) external view returns ( address );
    function playerInited ( address ) external view returns ( bool );
    function playerLocation ( address ) external view returns ( uint256 x, uint256 y );
    function registry (  ) external view returns ( address );
    function renounceOwnership (  ) external;
    function seed (  ) external view returns ( uint256 );
    function setCanMoveSnow ( address player, bool canMove ) external;
    function setCanMoveWater ( address player, bool canMove ) external;
    function setCanPutAnything ( address player, bool canPut ) external;
    function setQuestMaster ( address master ) external;
    function touchedCoords ( uint256 ) external view returns ( uint256 x, uint256 y );
    function transferOwnership ( address newOwner ) external;
    function transferTile ( Coords memory coords, address newOwner ) external;
    function validPlayerEmoji ( string memory ) external view returns ( string memory );
    function vecs ( uint256, uint256 ) external view returns ( int16 );
    function vecsDenom (  ) external view returns ( int16 );
    function whitelistedContracts ( uint256 ) external view returns ( address );
    function worldScale (  ) external view returns ( uint256 );
    function worldWidth (  ) external view returns ( uint256 );
}

`

const tinyWorldRegistry = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface TinyWorldRegistry {
    function getPlayerInfos (  ) external view returns ( address[] memory, address[] memory );
    function getProxyAddress ( address _realAddress ) external view returns ( address );
    function getRealAddress ( address _proxyAddress ) external view returns ( address );
    function proxyAddressToRealAddress ( address ) external view returns ( address );
    function realAddressToProxyAddress ( address ) external view returns ( address );
    function setProxyAddress ( address _proxyAddress ) external;
}
`

const types = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

enum TileType {
    UNKNOWN,
    WATER,
    SAND,
    TREE,
    STUMP,
    CHEST,
    FARM,
    WINDMILL,
    GRASS,
    SNOW,
    STONE,
    ICE
}

enum TemperatureType {
    COLD,
    NORMAL,
    HOT
}

enum AltitudeType {
    SEA,
    BEACH,
    LAND,
    MOUNTAIN,
    MOUNTAINTOP
}

struct Tile {
    Coords coords;
    uint256[2] perlin;
    uint256 raritySeed;
    TileType tileType;
    TemperatureType temperatureType;
    AltitudeType altitudeType;
    address owner;
    address smartContract;
    uint256 lastPurchased;
}

struct Coords {
    uint256 x;
    uint256 y;
}

`

const tileContractTest = `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "../contracts/TileContract.sol";
import "../contracts/Types.sol";

contract MyTileContractTest {
   
    bytes32[] proposalNames;
   
    MyTileContract myTileContract;
    function beforeAll () public {
        myTileContract = new MyTileContract();
    }
    
    function checkName () public {
        Assert.greaterThan(int(bytes(myTileContract.name(Coords(0, 0))).length), int(0), "name is not empty");
    }

    function checkEmoji () public {
        Assert.greaterThan(int(bytes(myTileContract.emoji(Coords(0, 0))).length), int(0), "emoji is not empty");
        Assert.lesserThan(int(bytes(myTileContract.emoji(Coords(0, 0))).length), int(10), "emoji is not too long");
    }

    function checkDescription () public {
        Assert.greaterThan(int(bytes(myTileContract.description(Coords(0, 0))).length), int(0), "description is not empty");
    }
}
`
const deployWithWeb3 = `// Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deployWithWeb3 script...')
        
        const contractName = 'MyTileContract' // Change this for other contract
        const constructorArgs = []    // Put constructor args (if any) here for your contract
    
        // Note that the script needs the ABI which is generated from the compilation artifact.
        // Make sure contract is compiled and artifacts are generated
        const artifactsPath = \`browser/contracts/artifacts/\${contractName}.json\` // Change this for different path

        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
        const accounts = await web3.eth.getAccounts()
    
        let contract = new web3.eth.Contract(metadata.abi)
    
        contract = contract.deploy({
            data: metadata.data.bytecode.object,
            arguments: constructorArgs
        })
    
        const newContractInstance = await contract.send({
            from: accounts[0],
            gas: 1500000,
            gasPrice: '30000000000'
        })
        console.log('Contract deployed at address: ', newContractInstance.options.address)
    } catch (e) {
        console.log(e.message)
    }
  })()`

const deployWithEthers = `// Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deployWithEthers script...')
    
        const contractName = 'MyTileContract' // Change this for other contract
        const constructorArgs = []    // Put constructor args (if any) here for your contract

        // Note that the script needs the ABI which is generated from the compilation artifact.
        // Make sure contract is compiled and artifacts are generated
        const artifactsPath = \`browser/contracts/artifacts/\${contractName}.json\` // Change this for different path
    
        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))
        // 'web3Provider' is a remix global variable object
        const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()
    
        let factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);
    
        let contract = await factory.deploy(...constructorArgs);
    
        console.log('Contract Address: ', contract.address);
    
        // The contract is NOT deployed yet; we must wait until it is mined
        await contract.deployed()
        console.log('Deployment successful.')
    } catch (e) {
        console.log(e.message)
    }
})()`

module.exports = {
  myTileContract: { name: 'contracts/MyTileContract.sol', content: myTileContract },
  tileContract: { name: 'contracts/TileContract.sol', content: tileContract },
  tinyWorldContract: { name: 'contracts/TinyWorld.sol', content: tinyWorld },
  tinyWorldRegistryContract: { name: 'contracts/TinyWorldRegistry.sol', content: tinyWorldRegistry },
  TypesContract: { name: 'contracts/Types.sol', content: types },
  deployWithWeb3: { name: 'scripts/deploy_web3.js', content: deployWithWeb3 },
  deployWithEthers: { name: 'scripts/deploy_ethers.js', content: deployWithEthers },
  tileContract_test: { name: 'tests/TileContract_test.sol', content: tileContractTest },
}
