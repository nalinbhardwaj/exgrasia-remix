'use strict'

const tileContract = `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface ITileContract {
    function tileEmoji() external view returns (string memory);

    function tileName() external view returns (string memory);

    function tileDescription() external view returns (string memory);

    function tileABI() external view returns (string memory);
}

contract MyTileContract is ITileContract {
    function tileEmoji() external view override returns (string memory) {
        return unicode"🌃";
    }

    function tileName() external view override returns (string memory) {
        return "Test Tile";
    }

    function tileDescription() external view override returns (string memory) {
        return "This is a test tile";
    }

    function tileABI() external view virtual override returns (string memory) {
        return "ipfs";
    }
}`

const tinyWorld = `// SPDX-License-Identifier: MIT
interface TinyWorld {
    function cachedTiles ( uint256, uint256 ) external view returns ( tuple coords, uint256 raritySeed, uint8 tileType, uint8 temperatureType, uint8 altitudeType, address owner, address smartContract, uint256 lastPurchased );
    function computePerlin ( uint32 x, uint32 y, uint32 seed, uint32 scale ) external view returns ( uint256 );
    function dist ( tuple a, tuple b ) external pure returns ( uint256 );
    function forceTileUpdate ( tuple coords ) external;
    function getCachedTile ( tuple coords ) external view returns ( tuple );
    function getCorners ( uint32 x, uint32 y, uint32 scale ) external pure returns ( uint32[2][4] );
    function getGradientAt ( uint32 x, uint32 y, uint32 scale, uint32 seed ) external view returns ( int16[2] );
    function getPlayerIds (  ) external view returns ( address[] );
    function getPlayerInfos (  ) external view returns ( tuple[], string[] );
    function getPlayerLocation ( address player ) external view returns ( tuple );
    function getSingleScalePerlin ( uint32 x, uint32 y, uint32 scale, uint32 seed ) external view returns ( int128 );
    function getTile ( tuple coords ) external returns ( tuple );
    function getTouchedTiles (  ) external view returns ( tuple[] );
    function getWeight ( uint32 cornerX, uint32 cornerY, uint32 x, uint32 y, uint32 scale ) external pure returns ( uint64 );
    function initPlayerLocation ( string repr ) external;
    function initialize ( uint256 _seed, uint256 _worldWidth, uint256 _worldScale, address _registryAddress ) external;
    function movePlayer ( tuple coords ) external;
    function ownTile ( tuple coords, address smartContract ) external;
    function owner (  ) external view returns ( address );
    function perlinMax (  ) external view returns ( uint16 );
    function playerEmoji ( address ) external view returns ( string );
    function playerIds ( uint256 ) external view returns ( address );
    function playerInited ( address ) external view returns ( bool );
    function playerLocation ( address ) external view returns ( uint256 x, uint256 y );
    function registry (  ) external view returns ( address );
    function renounceOwnership (  ) external;
    function seed (  ) external view returns ( uint256 );
    function smoothStep ( int128 x ) external pure returns ( int128 );
    function touchedCoords ( uint256 ) external view returns ( uint256 x, uint256 y );
    function transferOwnership ( address newOwner ) external;
    function transferTile ( tuple coords, address newOwner ) external;
    function validPlayerEmoji ( string ) external view returns ( string );
    function vecs ( uint256, uint256 ) external view returns ( int16 );
    function vecsDenom (  ) external view returns ( int16 );
    function worldScale (  ) external view returns ( uint256 );
    function worldWidth (  ) external view returns ( uint256 );
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

contract MyTileContractTest {
   
    bytes32[] proposalNames;
   
    MyTileContract myTileContract;
    function beforeAll () public {
        myTileContract = new MyTileContract();
    }
    
    function checkName () public {
        Assert.greaterThan(int(bytes(myTileContract.name()).length), int(0), "name is not empty");
    }

    function checkEmoji () public {
        Assert.greaterThan(int(bytes(myTileContract.emoji()).length), int(0), "emoji is not empty");
        Assert.lesserThan(int(bytes(myTileContract.emoji()).length), int(10), "emoji is not too long");
    }

    function checkDescription () public {
        Assert.greaterThan(int(bytes(myTileContract.description()).length), int(0), "description is not empty");
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
  tileContract: { name: 'contracts/TileContract.sol', content: tileContract },
  tinyWorldContract: { name: 'contracts/TinyWorld.sol', content: tinyWorld },
  TypesContract: { name: 'contracts/Types.sol', content: types },
  deployWithWeb3: { name: 'scripts/deploy_web3.js', content: deployWithWeb3 },
  deployWithEthers: { name: 'scripts/deploy_ethers.js', content: deployWithEthers },
  tileContract_test: { name: 'tests/TileContract_test.sol', content: tileContractTest },
}
