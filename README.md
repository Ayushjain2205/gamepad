# 🎮 Gamepad

**Lovable for onchain mini-games.**
In the age of vibe coding, people should be able to spin up their wildest ideas into games they can play, share, and monetize. Gamepad makes that possible: type an idea → get a fully onchain mini-game → own it, play it, and earn from it.

---

## 🌍 World App + Worldchain

Gamepad is built directly inside the **World App** as a mini-app, which gives us two powerful advantages:

- 🎮 **Built-in distribution** to millions of active users
- 🧑‍🤝‍🧑 **World ID = real human players**, no bots
- 💰 **Native payments** using **WLD and USDC** for paid games

On the infrastructure side, every mini-game is tied to its own **onchain token on Worldchain**, created through a factory smart contract written in Solidity. This makes monetization native, scalable, and global from day one.

---

## 🔐 Human Verification

We use **World App** to verify that users are real humans and not bots. This ensures a fair gaming environment where only verified players can participate. The World ID verification process is seamlessly integrated into our user onboarding flow.

**Implementation:** [WelcomePopup Component](https://github.com/Ayushjain2205/gamepad/blob/main/src/components/WelcomePopup/index.tsx#L42)

---

## 🪙 Token Factory

Every game gets its own unique **onchain token on Worldchain** created through our factory smart contract. This token serves as the game's native currency and can be used for in-game rewards, purchases, and monetization.

**Contract Address:** [0x0882cac0fbe26aca9fded8a88a6f6c2043609d6c](https://sepolia.worldscan.org/address/0x0882cac0fbe26aca9fded8a88a6f6c2043609d6c) (Worldchain Sepolia Testnet)

---

## 💳 Payment Integration

We've built a comprehensive payment system that supports **WLD and USDC** for paid games. Players can purchase game access, in-game items, or premium features using their World App wallet. The payment flow is designed to be seamless and secure.

**Implementation:** [PaymentOverlay Component](https://github.com/Ayushjain2205/gamepad/blob/main/src/components/PaymentOverlay/index.tsx)

---

## 🛠️ How it's Made

Gamepad is built as a **Next.js mini app**, with **MiniKit** powering World App and Worldcoin integrations. MiniKit made it seamless to plug into the World ecosystem for identity and distribution.

For AI, we use **Together AI as our LLM provider**, managing multiple models but primarily **Qwen** for code generation. This is what lets us turn raw user prompts into working game code.

Every mini-game launches with its own **onchain token on Worldchain**, created via a factory smart contract in **Solidity**.

We render games inside **Sandpack code sandboxes** to isolate them from the rest of the app. If one game crashes it does not affect the main application. One of the hardest problems was that scores live inside the sandbox but our token rewards API runs outside. To solve this, we built a **message passing architecture** so that scores can trigger onchain token rewards without breaking isolation.

---

## 🧩 Architecture Choices

We designed a **registry of 10–12 reusable game templates**, such as tap games, endless runners, and 3D runners. Each template is modular, broken down into chunks for physics, collisions, and scoring logic.

When a user enters a prompt, we **map it to the closest template** in our registry and then pass that into **Qwen** for customization. This hybrid approach combines the stability of pre-built mechanics with the flexibility of AI generation, making game creation faster, more reliable, and more fun.

---

## ✨ Vision

Gamepad is the **first bot-free onchain arcade.**
It’s as easy as making a TikTok, but instead of videos you’re creating games you actually own, share, and monetize.

---

Would you like me to also add a **"Tech Stack" section in bullets** (Next.js, MiniKit, Worldchain, Solidity, Sandpack, Together AI, Qwen) so it looks even more standard for GitHub?
