import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import config from "./config.js";
import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const tezos = new TezosToolkit(config.rpcUrl);
tezos.setProvider({
  signer: new InMemorySigner(process.env.PRIVATE_KEY),
});
const doc = fs.readFileSync("./README.md", "utf8");

app.get("/", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(doc);
});

app.post("/mint", async (req, res) => {
  try {
    console.log(req.body);
    const address = req.body.address;
    const tokenName = req.body.tokenName;
    const amount = 1000 * 10 ** 9;
    let contractAddress;
    if (tokenName == "kusd") {
      contractAddress = config.contracts.kusd;
    } else {
      contractAddress = config.contracts.usdtz;
    }

    const contract = await tezos.contract.at(contractAddress);
    const op = await contract.methods
      .transfer("tz1WNKahMHz1bkuAfZrsvtmjBhh4GJzw8YcU", address, amount)
      .send();
    // await op.confirmation();
    res.send({
      amount: amount,
      address: address,
      tokenAddress: contractAddress,
      opHash: op.hash,
    });
  } catch (err) {
    res.send({
      error: err,
    });
  }
});

app.listen(config.port, () => {
  console.log(`🚀 Listening at ${config.port}...`);
});
