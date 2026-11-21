"""台本（JSON）から、2人の会話の音声（MP3）を作る。
詳しい人＝青山龍星（ノーマル）、初心者＝玄野武宏（ノーマル）。"""
import io, json, re, subprocess, sys, wave
from pathlib import Path
from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

BASE = Path(__file__).parent
VOICES = {"expert": (BASE / "vvm_repo/vvms/15.vvm", 13), "beginner": (BASE / "vvm_repo/vvms/4.vvm", 11)}

ort = Onnxruntime.load_once(filename=str(BASE / "voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3"))
syn = Synthesizer(ort, OpenJtalk(str(BASE / "open_jtalk_dic_utf_8-1.11")), cpu_num_threads=4)
for vvm, _ in VOICES.values():
    with VoiceModelFile.open(vvm) as m:
        syn.load_voice_model(m)

# 読み上げで誤読しやすい単位を、読み仮名に置き換える
UNITS = [("km", "キロメートル"), ("m/s", "メートル毎秒"), ("m", "メートル"), ("GHz", "ギガヘルツ"),
         ("MHz", "メガヘルツ"), ("kg", "キログラム"), ("g", "グラム"), ("V", "ボルト"), ("%", "パーセント")]


WORDS = [("ⅡA", "ツーエー"), ("ⅡB", "ツービー"), ("Ⅲ", "スリー"), ("Ⅱ", "ツー"), ("Ⅰ", "ワン"),
         ("GHz", "ギガヘルツ"), ("MHz", "メガヘルツ")]


def readable(text: str) -> str:
    for unit, kana in UNITS:
        text = re.sub(rf"(?<=[0-9０-９]){re.escape(unit)}(?![A-Za-z])", kana, text)
    for word, kana in WORDS:
        text = text.replace(word, kana)
    return text


for src in sys.argv[2:]:
    script = json.load(open(src))
    frames, params = [], None
    for who, text in script["lines"]:
        style = VOICES[who][1]
        q = syn.create_audio_query(readable(text), style)
        q.speed_scale = 1.1
        q.post_phoneme_length = 0.35
        with wave.open(io.BytesIO(syn.synthesis(q, style))) as w:
            params = params or w.getparams()
            frames.append(w.readframes(w.getnframes()))
    tmp = BASE / "tmp.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setparams(params)
        w.writeframes(b"".join(frames))
    out = Path(sys.argv[1]) / f"{script['id']}.mp3"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-ac", "1", "-b:a", "64k", str(out)], check=True)
    print(out.name, round(out.stat().st_size / 1e6, 2), "MB")
