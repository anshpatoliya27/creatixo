import https from "https";

https.get("https://api.cloudinary.com/v1_1/dmvljplwu/ping", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Status:", res.statusCode, "Body:", data));
}).on("error", (err) => {
  console.error("HTTP Error:", err.message);
});
