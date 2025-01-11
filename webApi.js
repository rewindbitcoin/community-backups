/**
 * Project: Rewind Bitcoin
 * Website: https://rewindbitcoin.com
 *
 * Author: Jose-Luis Landabaso
 * Email: landabaso@gmail.com
 *
 * Contact Email: hello@rewindbitcoin.com
 *
 * License: MIT License
 *
 * Copyright (c) 2025 Jose-Luis Landabaso, Rewind Bitcoin
 */

import http from "http";

export default function webApi(port, bees) {
  const server = http.createServer(async (req, res) => {
    console.log(`[info] API request: ${req.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = pathname.split("/").filter(Boolean);

    if (req.method === "GET") {
      if (pathSegments.length === 1 && pathSegments[0] === "generate_204") {
        // Route: /generate-204
        console.log(`[info] Status 204`);
        res.statusCode = 204;
        return res.end();
      }
      let networkId, vaultId, command;

      if (
        pathSegments.length === 3 &&
        pathSegments[0] === "vaults" &&
        (pathSegments[2] === "get" || pathSegments[1] === "check")
      ) {
        //If :networkId not passed, assume its bitcoin
        // Route: /vaults/:vaultId/{get,check}
        networkId = "bitcoin";
        vaultId = pathSegments[1];
        command = pathSegments[2];
      } else if (
        pathSegments.length === 4 &&
        pathSegments[1] === "vaults" &&
        (pathSegments[3] === "get" || pathSegments[2] === "check")
      ) {
        // Route: /:networkId/vaults/:vaultId/{get,check}
        networkId = pathSegments[0];
        vaultId = pathSegments[2];
        command = pathSegments[3];
      } else {
        // Invalid route
        console.log(`[info] Status 404`);
        res.statusCode = 404;
        return res.end(`Not found: ${pathname}`);
      }

      // Validate networkId
      const bee = bees[networkId];
      if (!bee) {
        console.log(`[info] Status 400`);
        res.statusCode = 400;
        return res.end(`Invalid networkId: ${networkId}`);
      }

      // Validate vaultId
      if (!vaultId || !vaultId.length) {
        console.log(`[info] Status 400`);
        res.statusCode = 400;
        return res.end("Invalid request");
      }

      try {
        // Hypothetical call to your Bee retrieval logic
        const node = await bee.get(vaultId);

        if (!node || !node.value) {
          console.log(`[info] Status 404`);
          res.statusCode = 404;
          return res.end(`No data for ID ${vaultId}`);
        }

        if (command === "get") {
          console.log(`[info] Status 200`);
          res.writeHead(200, { "Content-Type": "application/octet-stream" });
          return res.end(node.value);
        } else if (command === "check") {
          console.log(`[info] Status 200`);
          return res.status(200).json({
            exists: true,
            message: `Data exists for vaultId: ${vaultId}`,
          });
        } else {
          console.log(`[info] Status 500`);
          res.statusCode = 500;
          return res.end("Internal server error");
        }
      } catch (err) {
        console.log(`[info] Status 500`);
        console.error(err);
        res.statusCode = 500;
        return res.end("Internal server error");
      }
    } else {
      // If we’re here, it’s either a wrong path or an unsupported method
      console.log(`[info] Status 404`);
      res.statusCode = 404;
      return res.end(`Not found: ${pathname}`);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, "0.0.0.0", () => {
      const actualPort = server.address().port; // If port is 0, retrieve assigned one
      console.log(
        `[info] API mode On. Http server listening on port: ${actualPort}`,
      );
      resolve(server);
    });
  });
}
