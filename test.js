
const fs = require("fs");
const text2wav = require("./text2wav-test/node_modules/text2wav");

async function testText2Wav() {

    console.log("=== TEXT2WAV NODE.JS TEST START ===");

    const text =
        "Bonjour, je suis Ranise MOISE. Bienvenue dans CampusNumérique FOBAS. Je suis votre Professeure IA.";

    console.log("Generation...");

    try {

        const audio = await text2wav(text, {
            voice: "fr",
            speed: 165,
            pitch: 50,
            noFinalPause: true
        });

        const outputFile =
            "/tmp/campus-text2wav-test.wav";

        fs.writeFileSync(
            outputFile,
            Buffer.from(audio)
        );

        console.log(
            "WAV CREATED:",
            outputFile
        );

        console.log(
            "SIZE:",
            audio.length,
            "bytes"
        );

        console.log(
            "=== TEXT2WAV TEST SUCCESS ==="
        );

    } catch (error) {

        console.error(
            "=== TEXT2WAV TEST FAILED ==="
        );

        console.error(error);

    }
}

testText2Wav();
```








    voice: "fr",
            speed: 165,
            pitch: 50,
            noFinalPause: true
        });

        const outputFile =
            "/tmp/campus-text2wav-test.wav";

        fs.writeFileSync(
            outputFile,
            Buffer.from(audio)
        );

        console.log(
            "WAV CREATED:",
            outputFile
        );

        console.log(
            "SIZE:",
            audio.length,
            "bytes"
        );

        console.log(
            "=== TEXT2WAV TEST SUCCESS ==="
        );

    } catch (error) {

        console.error(
            "=== TEXT2WAV TEST FAILED ==="
        );

        console.error(error);

    }
}

testText2Wav();