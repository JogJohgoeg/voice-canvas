# Native verification — 2026-09-12

TouchDesigner 2025.33230, 1280×720, target 60 fps, this Mac.

- Reopened the shipped `.toe` from a different project directory; recording resolved by relative path.
- Ten-second recording run: 58.91 fps; RMS range 0.0048–1.0000; bass, brightness and transient channels varied; no operator errors.
- Built-in microphone: 58.49 fps after warm-up, nonzero changing input/features, no operator errors. Initial device-startup run was 17.19 fps; startup is not included in the stable figure.
- GPU output exported directly from `out1` and inspected; shader compiled successfully.
- `verify.py` reproduces the ten-second feature checks inside TouchDesigner. It writes feature statistics, never microphone recordings.
- No end-to-end audio latency or external audio-interface test yet. 2048-sample FFT plus device buffers add latency.
- Serialized audio buffers removed from the distributed `.toe`; expanded project and new source scanned for credential names and personal absolute paths, no matches. Gitleaks was not installed.
