import http from "http";

http.get("http://api.cloudinary.com/v1_1/dmvljplwu/ping", (res) => {
  console.log("Cloudinary HTTP Status:", res.statusCode);
}).on("error", (err) => {
  console.error("Cloudinary HTTP Error:", err.message);
});
