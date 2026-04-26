const fetch = require("node-fetch");

async function testAPI() {

  const base = "http://localhost:5000";

  console.log("Testing server...");
  const server = await fetch(base);
  console.log(await server.text());

  console.log("Testing products...");
  const products = await fetch(`${base}/api/products`);
  console.log(await products.json());

}

testAPI();