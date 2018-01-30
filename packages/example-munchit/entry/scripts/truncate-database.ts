import { getConnection, destroyConnection, truncateAll } from "db";

if (process.env.NODE_ENV !== "test") {
  console.log("Refusing to truncate non-test db");
  process.exit(1);
}

(async () => {
  await truncateAll(getConnection());
  await destroyConnection();
})();
