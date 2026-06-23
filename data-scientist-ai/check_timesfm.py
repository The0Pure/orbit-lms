#!/usr/bin/env python3
"""Standalone check that TimesFM is installed and actually able to forecast.

Run after `pip install timesfm[torch]` (or `[flax]`/`[xreg]`) to confirm the
install works end-to-end, including downloading/loading the model checkpoint:

    python check_timesfm.py
"""
import sys

from src import timesfm_forecaster


def main():
    print("Checking TimesFM install...")
    ok, message = timesfm_forecaster.check_install()
    print(message)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
