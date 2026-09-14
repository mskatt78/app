"""One-off: generate spoken pronunciation audio for library mantras via OpenAI TTS."""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.openai import OpenAITextToSpeech

load_dotenv(Path(__file__).parent / ".env")

OUT_DIR = Path("/app/frontend/public/audio/mantras")

MANTRAS = {
    "1": ("Om", "Aum...... Aum...... Aum......"),
    "2": ("Om Mani Padme Hum", "Om... Mani... Padme... Hum....... Om Mani Padme Hum....... Om Mani Padme Hum......"),
    "3": ("Lokah Samastah Sukhino Bhavantu", "Lokah... Samastah... Sukhino... Bhavantu....... Lokah Samastah Sukhino Bhavantu....... Lokah Samastah Sukhino Bhavantu......"),
    "4": ("So Hum", "So...... Hum....... So...... Hum....... So Hum......"),
    "5": ("Sat Nam", "Sat...... Naam....... Sat...... Naam....... Sat Naam......"),
    "6": ("Om Namah Shivaya", "Om... Namah... Shivaya....... Om Namah Shivaya....... Om Namah Shivaya......"),
    "7": ("Gayatri Mantra", "Om Bhur Bhuvah Svaha... Tat Savitur Varenyam... Bhargo Devasya Dhimahi... Dhiyo Yo Nah Prachodayat....... Om Bhur Bhuvah Svaha... Tat Savitur Varenyam... Bhargo Devasya Dhimahi... Dhiyo Yo Nah Prachodayat......"),
    "8": ("Ham Sa", "Hahm...... Sah....... Hahm...... Sah....... Hahm Sah......"),
    "9": ("Om Gam Ganapataye Namaha", "Om... Gam... Ganapataye... Namaha....... Om Gam Ganapataye Namaha....... Om Gam Ganapataye Namaha......"),
    "10": ("Ra Ma Da Sa", "Raa... Maa... Daa... Saa... Saa... Say... So... Hung....... Raa Maa Daa Saa... Saa Say So Hung......"),
    "11": ("Aham Brahmasmi", "Aham... Brahmasmi....... Aham Brahmasmi....... Aham Brahmasmi......"),
    "12": ("Om Shanti Shanti Shanti", "Om... Shanti... Shanti... Shanti....... Om Shanti Shanti Shanti....... Om Shanti Shanti Shanti......"),
    "13": ("Om Ma Ni Pad Me Hum", "Om... Ma... Ni... Pad... Me... Hum....... Om Ma Ni Pad Me Hum....... Om Ma Ni Pad Me Hum......"),
    "14": ("Ra Ma Da Sa Sa Say So Hung", "Raa... Maa... Daa... Saa....... Saa... Say... So... Hung....... Raa Maa Daa Saa... Saa Say So Hung......"),
}


async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    tts = OpenAITextToSpeech(api_key=api_key)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for mantra_id, (name, text) in MANTRAS.items():
        out = OUT_DIR / f"{mantra_id}.mp3"
        if out.exists() and out.stat().st_size > 10000:
            print("skip", name)
            continue
        audio = await tts.generate_speech(text=text, model="tts-1-hd", voice="onyx", speed=0.75, response_format="mp3")
        out.write_bytes(audio)
        print("done", name, len(audio))


if __name__ == "__main__":
    asyncio.run(main())
