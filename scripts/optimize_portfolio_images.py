"""Create privacy-safe, web-optimized copies of selected portfolio photos.

Usage:
  python scripts/optimize_portfolio_images.py --source-root C:/path/to/hansttoo

The source photos are never modified. Output is written to public/portfolio.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


@dataclass(frozen=True)
class Asset:
    source_folder: str
    source_name: str
    output_name: str


ASSETS = (
    Asset("fotosperfil", "IMG_1455.JPG", "hans-tattoo-artist-nyc.webp"),
    Asset("tattoos", "DSCF7791.jpg", "anime-my-hero-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A6930.jpg", "anime-naruto-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A7440.jpg", "anime-manga-panel-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A3423.jpg", "microrealism-empire-state-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A1897.jpg", "microrealism-skeleton-tattoo-nyc.webp"),
    Asset("tattoos", "DSCF8878.jpg", "microrealism-dali-elephant-tattoo-nyc.webp"),
    Asset("tattoos", "9H8A0309.jpg", "fine-line-hummingbird-tattoo-nyc.webp"),
    Asset("tattoos", "DSCF6120.jpg", "fine-line-geometric-lotus-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A0063.jpg", "fine-line-botanical-tattoo-nyc.webp"),
)

MAX_LONG_EDGE = 1600
WEBP_QUALITY = 82


def optimize(source: Path, destination: Path) -> tuple[tuple[int, int], tuple[int, int]]:
    with Image.open(source) as opened:
        original_size = opened.size
        image = ImageOps.exif_transpose(opened)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        image.thumbnail((MAX_LONG_EDGE, MAX_LONG_EDGE), Image.Resampling.LANCZOS)
        output_size = image.size
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(
            destination,
            format="WEBP",
            quality=WEBP_QUALITY,
            method=6,
            optimize=True,
        )
    return original_size, output_size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", required=True, type=Path)
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "public" / "portfolio",
    )
    args = parser.parse_args()

    total_before = 0
    total_after = 0
    for asset in ASSETS:
        source = args.source_root / asset.source_folder / asset.source_name
        destination = args.output_root / asset.output_name
        if not source.is_file():
            raise FileNotFoundError(f"Missing source image: {source}")
        before = source.stat().st_size
        original_size, output_size = optimize(source, destination)
        after = destination.stat().st_size
        total_before += before
        total_after += after
        print(
            f"{asset.source_name}: {original_size[0]}x{original_size[1]} "
            f"-> {output_size[0]}x{output_size[1]}, "
            f"{before / 1024:.0f} KB -> {after / 1024:.0f} KB"
        )

    reduction = 100 * (1 - total_after / total_before)
    print(
        f"Total: {total_before / 1024 / 1024:.1f} MB -> "
        f"{total_after / 1024 / 1024:.1f} MB ({reduction:.1f}% smaller)"
    )


if __name__ == "__main__":
    main()
