# Piano repertoire / 钢琴曲库

Snapshot: 2026-09-12. This is a searchable, expandable catalogue, not a claim to contain every piano score ever published. Entries can be editions, movements or performances of the same work. Historical era comes from catalogue/composer metadata; mood and expression tags come from MIDI features.

| Source | Local entries | Public metadata | Licence / handling |
|---|---:|---:|---|
| [MAESTRO v3](https://magenta.tensorflow.org/datasets/maestro) | 1,276 | 0 | CC BY-NC-SA 4.0; local only, checksum-verified MIDI archive |
| [Mutopia](https://www.mutopiaproject.org/legal.html) | 788 | 788 | Per-item Public Domain, CC BY or CC BY-SA; exact licence retained |
| [Classical Piano MIDI Page](http://piano-midi.de/) | 331 | 331 | Bernd Krueger, [CC BY-SA 3.0 DE](http://piano-midi.de/copy.htm); local cache, attribution retained |
| [OpenScore Lieder](https://github.com/OpenScore/Lieder) | 1,356 | 1,356 | [CC0](https://github.com/OpenScore/Lieder/blob/main/LICENSE.txt); voice-and-piano notation, not all solo piano |
| [KernScores / Beethoven sonatas](https://github.com/craigsapp/beethoven-piano-sonatas) | 103 | 103 | Encoding rights not cleared; source links only, no public file redistribution |
| [IMSLP](https://imslp.org/) | 12 | 12 | Individually reviewed public-domain piano editions; official PDF download-flow links |
| **Total** | **3,866** | **2,590** | **33 curated files, 455,596 bytes** |

All **2,349 downloaded MIDI files** have fingerprints: 1,276 MAESTRO, 742 Mutopia and 331 Krueger. The public manifest retains the 1,073 non-MAESTRO fingerprints. Two Mutopia MIDI URLs, `mutopia-1829` and `mutopia-1830`, returned 404; other notation-only records have no MIDI fingerprint. Missing data is left unknown.

Fingerprints contain estimated key, duration, mean MIDI-encoded tempo, notes/second, velocity range, mean velocity and a 64-bin harmonic-tension curve. Encoded tempo is not a measured human beat rate; estimated harmony and mood are performance-mapping hints, not musicological annotations. Tags include historical era, calm/flowing/intense, major/minor and expressive/even velocity range.

## IMSLP review

Twelve editions were individually checked on the official [Chopin Op.9](https://imslp.org/wiki/Nocturnes,_Op.9_(Chopin,_Frederic)), [Beethoven Moonlight Sonata](https://imslp.org/wiki/Moonlight_sonata) and [Debussy Suite bergamasque](https://imslp.org/wiki/Claire_de_Lune_(Debussy,_Claude)) pages. The manifest records edition, file index, review date and evidence page. Restricted editions and uncleared attachments are omitted. No clearly public-domain MIDI/MusicXML attachment was verified for these selected editions. Links preserve IMSLP's own download flow; no automated PDF retrieval or waiting-page bypass occurs. Check the source's jurisdiction notice before downloading.

Krueger's apex HTTP site serves the author's licence and MIDI catalogue; its HTTPS endpoints failed during this snapshot. Downloads use a strict source allowlist and validate the MIDI header. Browsers on HTTPS may block direct HTTP MIDI fetches: use the local backend or fetch script. These files are not included in the public curated subset.

## Fetch the rest locally / 本地扩充

From the repository root:

```sh
python3 web/repertoire/fetch.py --source all
python3 web/repertoire/fetch.py --source all-midi
node web/repertoire/fingerprint.mjs
python3 run.py
```

Individual source choices: `maestro`, `mutopia`, `krueger`, `openscore`, `kern`, `imslp`. `merge` rebuilds the local manifest. Krueger imports the 25 composer pages and avoids duplicate format-0 copies. IMSLP reconstructs the reviewed edition allowlist without scraping PDFs. Kern conversion can be done separately with music21/humlib after checking the encoding rights; no conversion dependency is required by this project.

For a background fetch, run `nohup python3 web/repertoire/fetch.py --source all > /tmp/voice-repertoire-fetch.log 2>&1 &`, then inspect the log between tasks. Requests are cached and spaced by at least 1.1 seconds; responses and ZIP expansion have size limits, with an 8 GB total disk cap. This script never requests a single download over 2 GB.

Expanded MIDI and the local index stay under ignored `web/repertoire/local/`; the server prefers that index. The public curated files stay under `web/repertoire/curated/`. Re-run the fingerprint command after downloading more MIDI. The public site can play its bundled MIDI immediately; other items require the local backend or an allowed cross-origin source download.

To publish a reviewed subset from a separate local catalogue:

```sh
python3 build/export_repertoire.py PATH_TO_REPERTOIRE
python3 build/build.py
```

The exporter removes MAESTRO/non-commercial entries, includes only referenced Public Domain/CC0 curated files, and enforces the 30 MB cap. It never copies local caches. Public-domain compositions do not automatically make every performance or modern edition public domain; per-file rights remain authoritative.
