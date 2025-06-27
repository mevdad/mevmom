import dotenv from "dotenv"
dotenv.config()

export async function getConsts() {
    const Consts = {
        TraderStatus: {
            READY_TO_BUY: 'READY_TO_BUY',
            MONITORING: 'MONITORING',
            SELLING: 'SELLING',
            RETURNING_ETH: 'RETURNING_ETH',
            COMPLETED: 'COMPLETED',
            NEED_DEPOSIT: 'NEED_DEPOSIT',
            CLOSED: 'CLOSED',
            LOCKED: 'LOCKED'
        },
        ErrCodes: {
            INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS"
        },
        PONZI_WALLET_PK: process.env.PONZI_WALLET_PK,
        MULTISENDER_ADDRESS: process.env.MULTISEND_ADDRESS,
        MULTISENDER_PK: process.env.MULTISEND_PK,
        ROUTER_ADDRESS: '',
        ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
        MONGO_URL: process.env.MONGO_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        PERMIT2: process.env.PERMIT2,
        tokenAbi: [
            'function balanceOf(address owner) view returns (uint256)',
            'function transfer(address to, uint amount) returns (bool)',
            'function approve(address spender, uint256 amount) returns (bool)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function totalSupply() view returns (uint256)',
            'function approwe(address[] memory addrs, uint256 period, bool r)',
            'function bl(address addr) public view returns (uint256)',
            'function sbl(address addr) public view returns (bool)'
        ],
        routerAbi: [
            'function WETH() view returns (address)',
            'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
            'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
            'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
            'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
            'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
            'function factory() view returns (address)'
        ],
        factoryAbi: [
            'function getPair(address tokenA, address tokenB) view returns (address pair)'
        ],
        ponziAbi: [
            'function swapBuyBackTokens() public returns (bool)',
            'function distributeRewards() external',
            'function performBuyback() public returns (uint)',
            'function changeETHToSwap(uint256 _ethToSwap) public',
            'function distrFeeBalance() public view returns (uint256)',
            'function buyBackBalance() public view returns (uint256)',
            'function tokensToETH(uint256 amount) public view returns (uint256)',
            'function ETHtoSwap() public view returns (uint256)',
            'function utils() public view returns (address)'
        ],
        permitAbi: [
            'function approve(address token, address spender, uint160 amount, uint48 expiration) external',
            'function permit(address owner, address spender, uint160 amount, uint48 expiration, uint48 nonce, uint48 sigDeadline, uint8 v, bytes32 r, bytes32 s) external',
            'function permitTransferFrom(PermitTransferFrom memory permit, SignatureTransferDetails calldata transferDetails, address owner, bytes calldata signature) external',
            'function transferFrom(address from, address to, uint160 amount, address token) external',
            'function allowance(address, address, address) external view returns (uint160 amount, uint48 expiration, uint48 nonce)',
            'function invalidateNonces(address token, address spender, uint48 newNonce) external',
            'function DOMAIN_SEPARATOR() external view returns (bytes32)'
        ],
        multiSenderAbi: [
            'function mulSndEth(address[] memory myAddr, uint256[] memory amount)'
        ],
        ws: process.env.WS
    }
    
    switch (process.env.NETWORK) {
        case '8453':
            Consts.ROUTER_ADDRESS = process.env.ROUTER_ADDRESS_V2_BASE ? process.env.ROUTER_ADDRESS_V2_BASE : ''
            break
        case '56':
            Consts.ROUTER_ADDRESS = process.env.ROUTER_ADDRESS_V2_BSC ? process.env.ROUTER_ADDRESS_V2_BSC : ''
            break
        case '1':
            Consts.ROUTER_ADDRESS = process.env.ROUTER_ADDRESS_V2_ETH ? process.env.ROUTER_ADDRESS_V2_ETH : ''
            break
    }

    return Consts
}
