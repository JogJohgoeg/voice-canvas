"""Original eight-second test signal: silence, bass, treble, middle register."""
import math
from pathlib import Path
import struct
import wave
with wave.open(str(Path(__file__).with_name('test_signal.wav')), 'wb') as output:
    output.setparams((1, 2, 44100, 0, 'NONE', 'not compressed'))
    for i in range(44100 * 8):
        t = i / 44100
        section = int(t) // 2
        amplitude = [0, .1, .35, .12][section]
        hz = [110, 110, 880, 330][section]
        sample = amplitude * math.sin(2 * math.pi * hz * t) * min(1, (t % 2) * 15)
        output.writeframesraw(struct.pack('<h', int(sample * 32767)))
