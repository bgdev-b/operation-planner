import { createApp } from "./domain/http/app.js";

const app = createApp();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
});