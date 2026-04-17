import https from "https";

https.get("https://www.google.com", (res) => {
  console.log("Google Status:", res.statusCode);
}).on("error", (err) => {
  console.error("Google Error:", err.message);
});
