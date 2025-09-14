"use client";

import React, { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useSignTransaction, useDisconnectWallet } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";

const LoyaltyCardPage = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState("");
  const [transactionDigest, setTransactionDigest] = useState<string | null>(
    null
  );

  // Form states
  const [mintForm, setMintForm] = useState({
    customerId: "",
    imageUrl: "",
  });

  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const { mutateAsync: signTransaction } = useSignTransaction();

  console.log("signAndExecute", signAndExecute);

  const handleMintChange = (e: { target: { name: any; value: any } }) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  // Action: mint a new Loyalty card
  const mintLoyalty = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl),
        ],
      });

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
          chain: "sui:testnet",
        });

      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Always report transaction effects to the wallet after execution
      reportTransactionEffects(JSON.stringify(result.rawEffects!));

      console.log("result.digest", result.digest);

      setTransactionDigest(result.digest);

      setMintForm({ customerId: "", imageUrl: "" });
    } catch (error: any) {
      console.error("Error minting loyalty card:", error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Mint Your NFT on SUI
          </h1>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>

        {/* Package ID Input */}
        <div className="bg-black rounded-lg border border-white p-6 mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Package ID
          </label>
          <input
            type="text"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="Enter Package ID"
            className="w-full px-3 py-2 bg-black border border-white rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
          />
        </div>

        {/* Mint Loyalty Card Form */}
        <div className="bg-black rounded-lg border border-white p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Mint Loyalty Card
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                name="customerId"
                value={mintForm.customerId}
                onChange={handleMintChange}
                placeholder="Enter Customer Sui Address"
                className="w-full px-3 py-2 bg-black border border-white rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={mintForm.imageUrl}
                onChange={handleMintChange}
                placeholder="Enter Image URL"
                className="w-full px-3 py-2 bg-black border border-white rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={mintLoyalty}
                disabled={
                  loading ||
                  !mintForm.customerId.trim() ||
                  !mintForm.imageUrl.trim()
                }
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  loading ||
                  !mintForm.customerId.trim() ||
                  !mintForm.imageUrl.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
                    Minting...
                  </div>
                ) : (
                  "Mint your NFT"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Digest Display */}
        {transactionDigest && (
          <div className="bg-black rounded-lg border border-white p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Transaction Successful! 🎉
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Transaction Digest
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={transactionDigest}
                    readOnly
                    className="flex-1 px-3 py-2 bg-black border border-white rounded-md text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transactionDigest);
                      alert("Digest copied to clipboard!");
                    }}
                    className="px-3 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://explorer.polymedia.app/txblock/${transactionDigest}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View on Polymedia Explorer
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Status indicator */}
        {currentAccount && (
          <div className="mt-6 p-4 bg-black border border-white rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-white">
                  Wallet connected: {currentAccount.address.slice(0, 6)}...
                  {currentAccount.address.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyCardPage;
