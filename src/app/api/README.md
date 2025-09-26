# Gamepad API Documentation

This folder contains the API routes for the Gamepad application, including token creation and reward distribution functionality.

## Routes

### 1. Create Token API

**Endpoint:** `POST /api/create-token`

Creates a new ERC20 token using a factory contract and returns both the transaction hash and deployed token address.

#### Request Body

```json
{
  "name": "string",           // Token name (required)
  "symbol": "string",         // Token symbol, max 8 characters (required)
  "decimals": number,         // Token decimals, 0-30, defaults to 18 (optional)
  "premint": "string",        // Amount to premint in wei, defaults to "0" (optional)
  "premintTo": "string"       // Address to receive preminted tokens (required)
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Match Game",
    "symbol": "MATCH",
    "decimals": 18,
    "premint": "1000000000000000000000",
    "premintTo": "0xCafa93E9985793E2475bD58B9215c21Dbd421fD0"
  }'
```

#### Response

```json
{
  "txHash": "0xcaaba4b0631710c61b6b5b14e33fa2cb0764e1fb626b2333e4db086e66d991a9",
  "tokenAddress": "0xc6cd202787df71164c3303aa4e503a71c0a574f1"
}
```

#### Error Response

```json
{
  "error": "Error message"
}
```

---

### 2. Reward API

**Endpoint:** `POST /api/reward`

Mints tokens to a player's address. The API automatically detects token decimals if not provided.

#### Request Body

```json
{
  "token": "string",          // Token contract address (required)
  "player": "string",         // Player's wallet address (required)
  "amount": "string",         // Amount to mint in human-readable units (required)
  "decimals": number          // Token decimals, auto-detected if not provided (optional)
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/reward \
  -H "Content-Type: application/json" \
  -d '{
    "token": "0xc6cd202787df71164c3303aa4e503a71c0a574f1",
    "player": "0xCafa93E9985793E2475bD58B9215c21Dbd421fD0",
    "amount": "100"
  }'
```

#### Response

```json
{
  "txHash": "0x89bf2421ff6950196cac57543ee94a9c0726144c28b2f9c58e463c7cc4179efb"
}
```

#### Error Response

```json
{
  "error": "Error message"
}
```

---

## Environment Variables

The following environment variables must be set in your `.env.local` file:

```env
# Blockchain Configuration
RPC_URL=https://worldchain-sepolia.gateway.tenderly.co
CHAIN_ID=4801
FACTORY_ADDRESS=0x0882CAc0fBe26ACA9fdED8a88A6f6c2043609D6C

# Minter Account (must have minting permissions)
MINTER_PRIVATE_KEY=0x8ef8b56af754aecbce479a5ea129dc97d807a9af90c731d476dc534f9c1085d5
```

## Network

- **Network**: World Chain Sepolia Testnet
- **Chain ID**: 4801
- **Currency**: ETH
- **RPC**: Tenderly Gateway

## Usage Flow

1. **Create a Token**: Use the create-token API to deploy a new ERC20 token
2. **Save Token Address**: Store the returned `tokenAddress` for future use
3. **Reward Players**: Use the reward API with the saved token address to mint tokens to players

## Error Handling

Both APIs return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors, invalid parameters)
- `429`: Rate Limited (RPC endpoint rate limits)
- `500`: Internal Server Error

## Rate Limits

The Tenderly RPC endpoint has rate limits. If you encounter a 429 error, wait a moment before retrying or consider using a different RPC provider with higher limits.

## Security Notes

- The `MINTER_PRIVATE_KEY` should be kept secure and never exposed in client-side code
- Ensure the minter account has sufficient ETH for gas fees
- The minter account must have minting permissions on the token contracts
