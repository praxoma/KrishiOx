"""
Generates KrishiOx app icons: charcoal background, gold->copper gradient
rounded square / circle mark with "GP" monogram, wheat-sheaf accent.
No external assets — pure PIL drawing.
"""
from PIL import Image, ImageDraw, ImageFont
import math

CHARCOAL = (17, 24, 39, 255)
GOLD = (217, 164, 65, 255)
COPPER = (139, 90, 43, 255)
IVORY = (247, 245, 242, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def gradient_diagonal(size, c1, c2):
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = lerp(c1, c2, t)
    return img


def rounded_mask(size, radius_ratio):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    return mask


def draw_wheat(draw, cx, cy, scale, color):
    """Simple stylised wheat sheaf made of strokes."""
    stem_h = 0.34 * scale
    draw.line([(cx, cy + stem_h), (cx, cy - stem_h * 0.2)], fill=color, width=max(2, int(scale * 0.035)))
    n_leaves = 5
    for i in range(n_leaves):
        t = i / (n_leaves - 1)
        y = cy - stem_h * 0.2 + t * (stem_h * 1.1)
        spread = (0.16 + 0.10 * t) * scale
        length = (0.10 + 0.05 * (1 - t)) * scale
        for side in (-1, 1):
            x0, y0 = cx, y
            x1 = cx + side * spread
            y1 = y - length
            draw.line([(x0, y0), (x1, y1)], fill=color, width=max(2, int(scale * 0.028)))


def make_icon(size, maskable=False, monogram=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    if maskable:
        # Full-bleed background required for maskable icons (safe zone ~80%)
        bg = gradient_diagonal(size, (27, 35, 51, 255), CHARCOAL)
        img.paste(bg, (0, 0))
    else:
        radius_ratio = 0.22
        bg = gradient_diagonal(size, (27, 35, 51, 255), CHARCOAL)
        mask = rounded_mask(size, radius_ratio)
        img.paste(bg, (0, 0), mask)

    draw = ImageDraw.Draw(img)

    # Gold/copper emblem circle in the center
    margin = size * (0.26 if maskable else 0.20)
    emblem_box = [margin, margin, size - margin, size - margin]
    # gradient-filled circle via mask
    circ_size = int(size - 2 * margin)
    circ_grad = gradient_diagonal(circ_size, GOLD, COPPER)
    circ_mask = Image.new("L", (circ_size, circ_size), 0)
    cd = ImageDraw.Draw(circ_mask)
    cd.ellipse([0, 0, circ_size - 1, circ_size - 1], fill=255)
    img.paste(circ_grad, (int(margin), int(margin)), circ_mask)

    cx, cy = size / 2, size / 2
    wheat_scale = circ_size * 0.62
    draw_wheat(draw, cx, cy - circ_size * 0.02, wheat_scale, CHARCOAL)

    return img


def save(img, path):
    img.save(path, "PNG")
    print("wrote", path, img.size)


if __name__ == "__main__":
    import os
    os.makedirs("icons", exist_ok=True)

    save(make_icon(192, maskable=False), "icons/icon-192.png")
    save(make_icon(512, maskable=False), "icons/icon-512.png")
    save(make_icon(192, maskable=True), "icons/icon-192-maskable.png")
    save(make_icon(512, maskable=True), "icons/icon-512-maskable.png")
    save(make_icon(180, maskable=False), "icons/apple-touch-icon.png")
    save(make_icon(32, maskable=False), "icons/favicon-32.png")
    save(make_icon(16, maskable=False), "icons/favicon-16.png")
