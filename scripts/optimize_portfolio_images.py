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
    Asset("tattoos", "761250908_18431786974193052_1769191233520933510_n.jpg", "anime-madara-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A7440.jpg", "anime-manga-panel-tattoo-nyc.webp"),
    Asset("tattoos", "IMG-3815.JPG", "anime-dragon-ball-tattoo-nyc.webp"),
    Asset("tattoos", "1EZ4A7628.jpg", "anime-mushroom-girl-tattoo-nyc.webp"),
    Asset("tattoos", "771984118_18432989746193052_3633902411544084380_n.jpg", "anime-akaza-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A3423.jpg", "microrealism-empire-state-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A1897.jpg", "microrealism-skeleton-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A6434.jpg", "microrealism-melting-clock-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A6033-Mejorado-NR.png", "microrealism-sea-turtle-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A0031.jpg", "microrealism-praying-hands-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A7457.jpg", "microrealism-skeleton-hand-rose-tattoo-nyc.webp"),
    Asset("tattoos", "9H8A0309.jpg", "fine-line-hummingbird-tattoo-nyc.webp"),
    Asset("tattoos", "DSCF6120.jpg", "fine-line-geometric-lotus-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A0063.jpg", "fine-line-botanical-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A6873.jpg", "fine-line-botanical-heart-tattoo-nyc.webp"),
    Asset("tattoos", "DSCF0578.jpg", "fine-line-couple-tattoo-nyc.webp"),
    Asset("tattoos", "EZ4A6359.jpg", "fine-line-octopus-tattoo-nyc.webp"),
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
