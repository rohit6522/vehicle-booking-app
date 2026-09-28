if (
  process.env.NODE_ENV === "production" &&
  typeof window !== "undefined"
) {
  console.log = () => {};
}