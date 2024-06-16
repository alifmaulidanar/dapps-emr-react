const CONN = Object.freeze({
  SERVER: 3000,
  GANACHE_LOCAL: "http://127.0.0.1:7545",
  GANACHE_VPS_BACKEND: "http://103.175.217.196:8545",
  GANACHE_VPS_FRONTEND: "https://ganache-vps-1145.loca.lt",
  BACKEND_LOCAL: "http://localhost:3000",
  FRONTEND_LOCAL: "http://localhost:5173",
  IPFS_LOCAL: "http://127.0.0.1:8081/ipfs",
  IPFS_VPS: "http://103.175.217.196:8081",
  IPFS_INFURA: "https://dapp-emr.infura-ipfs.io/ipfs", // deprecated

  ADMIN_PUBLIC_KEY: "0xF3d9a8Ca72CF813C5FD1897f38C42dC726Db6A97",
  ADMIN_PRIVATE_KEY: "0xad44c6613c71be716aea9e6e0233e0f4d4e535c7f0f6ea4209d66545df0b1a2e",
});

export { CONN };
