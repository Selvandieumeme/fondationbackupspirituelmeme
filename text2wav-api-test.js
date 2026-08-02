const http = require("http");
const text2wav = require("./text2wav-test/node_modules/text2wav");

const PORT = 3099;

const server = http.createServer(async (req, res) => {

    if(
        req.method !== "POST" ||
        req.url !== "/tts"
    ){

        res.writeHead(404);
        res.end("Not found");
        return;

    }

    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", async () => {

        try {

            const data =
                JSON.parse(body);

            const text =
                typeof data.text === "string"
                    ? data.text.trim()
                    : "";

            if(!text){

                res.writeHead(400, {
                    "Content-Type":
                        "application/json"
                });

                res.end(
                    JSON.stringify({
                        error:
                            "TEXT_REQUIRED"
                    })
                );

                return;

            }

            const start =
                Date.now();

            const audio =
                await text2wav(text, {

                    voice:
                        "fr",

                    speed:
                        165,

                    pitch:
                        50,

                    noFinalPause:
                        true

                });

            const elapsed =
                (Date.now() - start) / 1000;

            console.log(
                "TTS:",
                elapsed.toFixed(2),
                "seconds"
            );

            res.writeHead(200, {

                "Content-Type":
                    "audio/wav",

                "Content-Length":
                    audio.length,

                "Cache-Control":
                    "no-store"

            });

            res.end(
                Buffer.from(audio)
            );

        } catch(error){

            console.error(
                "TTS ERROR:",
                error
            );

            res.writeHead(500, {

                "Content-Type":
                    "application/json"

            });

            res.end(
                JSON.stringify({

                    error:
                        "TTS_GENERATION_FAILED"

                })
            );

        }

    });

});

server.listen(
    PORT,
    "127.0.0.1",
    () => {

        console.log(
            "TEXT2WAV API TEST READY"
        );

        console.log(
            "http://127.0.0.1:" +
            PORT +
            "/tts"
        );

    }
);