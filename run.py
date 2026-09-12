#!/usr/bin/env python3
"""Run the optional local backend; Ctrl-C stops this foreground launcher."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).resolve().parent/'server'/'serve.py'),run_name='__main__')
