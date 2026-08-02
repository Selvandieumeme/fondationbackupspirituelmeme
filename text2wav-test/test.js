// =====================================
// TEXT2WAV NODE.JS TEST
// CAMPUS AI PROFESSOR
// FRENCH TTS TEST
// =====================================

const fs = require("fs");
const text2wav = require("text2wav");



async function testText2Wav(){

    console.log("=== TEXT2WAV NODE.JS TEST START ===");


    const text =
        "Bonjour, je suis Ranise MOISE. Bienvenue dans CampusNumérique FOBAS. Je suis votre Professeure IA.";


    console.log("TEXT:");
    console.log(text);


    try{

        console.log("Generating French voice...");


        const audio =
            await text2wav(

                text,

                {
                    voice:
                        "fr",

                    speed:
                        165,

                    pitch:
                        50,

                    noFinalPause:
                        true
                }

            );


        console.log(
            "AUDIO GENERATED:",
            audio.length,
            "bytes"
        );


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
            "=== TEXT2WAV NODE.JS TEST SUCCESS ==="
        );


    }catch(error){

        console.error(
            "=== TEXT2WAV NODE.JS TEST FAILED ==="
        );

        console.error(
            error
        );

    }

}



testText2Wav();