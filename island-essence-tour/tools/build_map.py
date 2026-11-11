"""
Builds the Mahé relief map from real elevation data.

  python3 tools/build_map.py [tile-cache-dir]

Downloads Terrarium elevation tiles (AWS Open Data "Terrain Tiles", which
combine SRTM land elevation and GEBCO bathymetry), then writes:

  assets/map-terrain.jpg   the printed surface of the 3D map board
  js/map-geo.js            stop positions, route paths, roads and labels
                           in board units (the board is 1000 x 1200)

Stop and road positions are given in latitude/longitude below. Roads are
traced by hand along the terrain, so they are close to, not exactly on,
the real roads.

Needs: numpy, scipy, scikit-image, Pillow.
"""
import json, math, os, sys, urllib.request
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '.tiles')

BOARD_W, BOARD_H = 1000, 1200
RES = 2.4                      # output pixels per board unit
Z = 13
N = 2 ** Z
TX0, TX1, TY0, TY1 = 5355, 5361, 4198, 4206   # tiles covering Mahé at z13

# ------------------------------------------------------------------ places
# (lat, lon)
STOPS = {
    'hotel':   (-4.6158, 55.4278),   # Beau Vallon
    'market':  (-4.6176, 55.4536),   # Sir Selwyn Selwyn-Clarke Market, Victoria
    'museum':  (-4.6197, 55.4519),   # National Museum of History, Victoria
    'venn':    (-4.6402, 55.4270),   # Venn's Town - Mission Lodge, Sans Souci
    'marengo': (-4.6983, 55.5181),   # Maison Marengo, Domaine de Val des Pres
    'craft':   (-4.7008, 55.5167),   # Craft village
    'moutya':  (-4.7031, 55.5180),   # Moutya performance area
}
STOPS['dropoff'] = STOPS['hotel']

BEL_AIR = [(-4.6215, 55.4497), (-4.6240, 55.4475)]
SANS_SOUCI_UP = [(-4.6275, 55.4450), (-4.6305, 55.4420), (-4.6325, 55.4385),
                 (-4.6350, 55.4350), (-4.6372, 55.4318), (-4.6390, 55.4292)]
EAST_COAST = [(-4.6268, 55.4545), (-4.6330, 55.4625), (-4.6400, 55.4675),
              (-4.6470, 55.4705), (-4.6575, 55.4820), (-4.6660, 55.4925),
              (-4.6730, 55.5025), (-4.6810, 55.5115), (-4.6880, 55.5165),
              (-4.6940, 55.5178)]
ST_LOUIS = [(-4.6170, 55.4318), (-4.6192, 55.4368), (-4.6203, 55.4418),
            (-4.6196, 55.4465), (-4.6185, 55.4505)]

LEGS = [
    [STOPS['hotel']] + ST_LOUIS + [STOPS['market']],
    [STOPS['market'], (-4.6186, 55.4532), STOPS['museum']],
    [STOPS['museum']] + BEL_AIR + SANS_SOUCI_UP + [STOPS['venn']],
    [STOPS['venn']] + SANS_SOUCI_UP[::-1] + BEL_AIR[::-1][:1] + [(-4.6232, 55.4525)] + EAST_COAST + [STOPS['marengo']],
    [STOPS['marengo'], (-4.6995, 55.5170), STOPS['craft']],
    [STOPS['craft'], (-4.7022, 55.5170), STOPS['moutya']],
    [STOPS['moutya'], (-4.6990, 55.5180)] + EAST_COAST[::-1] + [(-4.6232, 55.4525), (-4.6195, 55.4500)] + ST_LOUIS[::-1] + [STOPS['dropoff']],
]

# Other roads drawn faintly on the map
EXTRA_ROADS = [
    # Sans Souci road down to Port Glaud
    [STOPS['venn'], (-4.6430, 55.4225), (-4.6470, 55.4165), (-4.6500, 55.4090), (-4.6530, 55.4010)],
    # La Misere road to Grand Anse
    [(-4.6470, 55.4705), (-4.6560, 55.4640), (-4.6640, 55.4600), (-4.6720, 55.4560), (-4.6800, 55.4545)],
    # Les Canelles road
    [(-4.6940, 55.5178), (-4.6990, 55.5080), (-4.7060, 55.4980), (-4.7120, 55.4880)],
    # North coast from Beau Vallon to Victoria via Glacis
    [STOPS['hotel'], (-4.6100, 55.4315), (-4.6000, 55.4320), (-4.5900, 55.4330), (-4.5800, 55.4380),
     (-4.5760, 55.4460), (-4.5850, 55.4560), (-4.5950, 55.4600), (-4.6060, 55.4560), (-4.6140, 55.4530)],
]

LABELS = [
    # text, lat, lon, class, rotation
    ('Victoria', -4.6165, 55.4590, 'lbl-town', 0),
    ('Beau Vallon', -4.6085, 55.4060, 'lbl-town', 0),
    ('Sans Souci', -4.6315, 55.4330, 'lbl-town', 0),
    ('Au Cap', -4.7035, 55.5275, 'lbl-town', 0),
    ('Anse Royale', -4.7380, 55.5250, 'lbl-place', 0),
    ('Airport', -4.6750, 55.5370, 'lbl-place', 0),
    ('Port Glaud', -4.6560, 55.3880, 'lbl-place', 0),
    ('Grand Anse', -4.6830, 55.4400, 'lbl-place', 0),
    ('Takamaka', -4.7720, 55.4930, 'lbl-place', 0),
    ('Ste Anne Marine Park', -4.5960, 55.4880, 'lbl-place', 0),
    ('Cerf Island', -4.6250, 55.5000, 'lbl-place', 0),
]

# ------------------------------------------------------------------ data
def fetch_tiles():
    os.makedirs(CACHE, exist_ok=True)
    H, W = (TY1 - TY0 + 1) * 256, (TX1 - TX0 + 1) * 256
    E = np.zeros((H, W), np.float32)
    for x in range(TX0, TX1 + 1):
        for y in range(TY0, TY1 + 1):
            f = os.path.join(CACHE, f'{Z}_{x}_{y}.png')
            if not os.path.exists(f):
                url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png'
                urllib.request.urlretrieve(url, f)
            a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
            E[(y - TY0) * 256:(y - TY0 + 1) * 256, (x - TX0) * 256:(x - TX0 + 1) * 256] = \
                a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    return E


def ll2px(lat, lon):
    gx = (lon + 180) / 360 * N
    r = math.radians(lat)
    gy = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * N
    return (gx - TX0) * 256, (gy - TY0) * 256


def main():
    E = fetch_tiles()
    Es = ndimage.gaussian_filter(E, 1.0)

    # Frame the board around the main island.
    lab, _ = ndimage.label(Es > 0.5)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, lab.max() + 1))
    main_id = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == main_id)
    cx, cy = (xs.min() + xs.max()) / 2 + 40, (ys.min() + ys.max()) / 2 + 10
    h_px = (ys.max() - ys.min()) * 1.10
    w_px = h_px * BOARD_W / BOARD_H
    u = BOARD_W / w_px                         # board units per mosaic px
    crop_x0, crop_y0 = cx - w_px / 2, cy - h_px / 2
    m_per_px = 2 * math.pi * 6378137 / (N * 256) * math.cos(math.radians(-4.67))
    m_per_unit = m_per_px / u

    def board(lat, lon):
        px, py = ll2px(lat, lon)
        return ((px - crop_x0) * u, (py - crop_y0) * u)

    def elev(lat, lon):
        px, py = ll2px(lat, lon)
        return float(ndimage.map_coordinates(Es, [[py], [px]], order=1)[0])

    # Sanity check: every stop and route point should be on land.
    for i, leg in enumerate(LEGS + EXTRA_ROADS):
        for lat, lon in leg:
            e = elev(lat, lon)
            if e < 1:
                print(f'warning: route {i} point {lat},{lon} is in the sea ({e:.1f} m)')
    for k, (lat, lon) in STOPS.items():
        print(f'{k:8s} {elev(lat, lon):6.0f} m  board {board(lat, lon)[0]:.0f},{board(lat, lon)[1]:.0f}')

    # ------------------------------------------------------------- raster
    OH, OW = int(BOARD_H * RES), int(BOARD_W * RES)
    gy, gx = np.mgrid[0:OH, 0:OW].astype(np.float32)
    my = crop_y0 + gy / RES / u
    mx = crop_x0 + gx / RES / u
    Eo = ndimage.map_coordinates(E, [my, mx], order=3, mode='nearest')
    outside = (mx < 0) | (my < 0) | (mx > E.shape[1] - 1) | (my > E.shape[0] - 1)
    Eo[outside] = -40
    Eo = ndimage.gaussian_filter(Eo, 1.4)

    land = ndimage.gaussian_filter((Eo > 1.5).astype(np.float32), 1.5) > 0.5
    land = ndimage.binary_fill_holes(land)          # fills small data gaps (e.g. at the summit)
    lab2, n2 = ndimage.label(land)
    if n2:
        s2 = ndimage.sum(np.ones_like(lab2), lab2, range(1, n2 + 1))
        land &= np.isin(lab2, np.where(s2 >= 900)[0] + 1)   # drop data-noise specks
        lab2, n2 = ndimage.label(land)
    # fill elevation-data voids inland with the nearest valid height
    dist_tmp = ndimage.distance_transform_edt(land) / RES
    void = land & (Eo < 3) & (dist_tmp > 8)
    if void.any():
        idx = ndimage.distance_transform_edt(void, return_distances=False, return_indices=True)
        Eo = np.where(void, Eo[idx[0], idx[1]], Eo)
        Eo = np.where(ndimage.binary_dilation(void, iterations=6), ndimage.gaussian_filter(Eo, 3), Eo)
    Eo = np.where(land, np.maximum(Eo, 1), np.minimum(Eo, -0.5))

    cell = m_per_unit / RES
    zx = ndimage.sobel(Eo, axis=1) / (8 * cell) * 2.2
    zy = ndimage.sobel(Eo, axis=0) / (8 * cell) * 2.2
    slope = np.arctan(np.hypot(zx, zy))
    aspect = np.arctan2(-zy, zx)
    az, alt = math.radians(315 - 90), math.radians(42)
    hs = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    hs = np.clip(hs, 0, 1)

    # hypsometric tint
    stops_e = np.array([0, 15, 80, 220, 420, 650, 905])
    cols = np.array([[176, 206, 128], [154, 198, 112], [118, 176, 88], [74, 142, 70],
                     [46, 112, 60], [40, 92, 58], [96, 108, 90]], np.float32)
    t = np.clip(Eo, 0, 905)
    tint = np.stack([np.interp(t, stops_e, cols[:, c]) for c in range(3)], -1)
    shade = (0.38 + 0.85 * hs)[..., None]
    land_rgb = np.clip(tint * shade + 10, 0, 255)

    # sand along the shore
    dist_in = ndimage.distance_transform_edt(land) / RES       # board units
    sand = np.clip(1 - (dist_in - 0.3) / 0.9, 0, 1)[..., None] * land[..., None]
    land_rgb = land_rgb * (1 - sand * 0.85) + np.array([243, 227, 179]) * sand * 0.85

    # sea: depth tint + reef glow near the coast
    dist_out = ndimage.distance_transform_edt(~land) / RES
    # The Mahé plateau is shallow everywhere, so colour mostly by distance from shore
    # (lagoon -> reef -> open water), with a hint of the real bathymetry.
    depth = np.clip(-Eo, 0, 60)
    far = np.clip(dist_out / 60, 0, 1)[..., None]
    deep = np.array([12, 74, 104], np.float32) * (1 - far) + np.array([9, 62, 92], np.float32) * far
    deep = deep * (1 + (12 - np.clip(depth, 0, 24))[..., None] * 0.012)
    lagoon = np.exp(-dist_out / 7)[..., None]
    sea_rgb = deep * (1 - lagoon * 0.8) + np.array([96, 214, 206]) * lagoon * 0.8
    shelf = (np.exp(-dist_out / 28) * 0.28)[..., None]
    sea_rgb = sea_rgb * (1 - shelf) + np.array([40, 150, 170]) * shelf
    reef = (np.exp(-((dist_out - 6) / 2.0) ** 2) * 0.25)[..., None]
    sea_rgb = sea_rgb * (1 - reef) + np.array([190, 240, 232]) * reef
    rng = np.random.default_rng(3)
    waves = ndimage.gaussian_filter(rng.standard_normal((OH, OW)), (1.0, 16))
    sea_rgb *= (1 + waves[..., None] * 0.9)

    rgb = np.where(land[..., None], land_rgb, sea_rgb)
    rgb = np.clip(rgb * np.array([1.0, 1.0, 1.0]), 0, 255).astype(np.uint8)
    im = Image.fromarray(rgb)
    d = ImageDraw.Draw(im, 'RGBA')

    # graticule every 0.05 degrees
    for lon in np.arange(55.30, 55.66, 0.05):
        x0, _ = board(-4.4, lon); d.line([(x0 * RES, 0), (x0 * RES, OH)], fill=(255, 255, 255, 22), width=2)
    for lat in np.arange(-4.85, -4.45, 0.05):
        _, y0 = board(lat, 55.4); d.line([(0, y0 * RES), (OW, y0 * RES)], fill=(255, 255, 255, 22), width=2)

    # frame
    sand_c = (243, 227, 179)
    d.rectangle([14 * RES, 14 * RES, (BOARD_W - 14) * RES, (BOARD_H - 14) * RES], outline=sand_c + (140,), width=5)
    d.rectangle([24 * RES, 24 * RES, (BOARD_W - 24) * RES, (BOARD_H - 24) * RES], outline=sand_c + (70,), width=2)

    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf', int(13 * RES))
    except OSError:
        font = ImageFont.load_default()

    # compass
    cxp, cyp = 880 * RES, 110 * RES
    r = 54 * RES
    d.ellipse([cxp - r, cyp - r, cxp + r, cyp + r], outline=sand_c + (130,), width=3)
    d.polygon([(cxp, cyp - 60 * RES), (cxp + 9 * RES, cyp), (cxp, cyp + 60 * RES), (cxp - 9 * RES, cyp)], fill=sand_c + (230,))
    d.polygon([(cxp - 60 * RES, cyp), (cxp, cyp - 9 * RES), (cxp + 60 * RES, cyp), (cxp, cyp + 9 * RES)], fill=sand_c + (120,))
    d.polygon([(cxp, cyp - 60 * RES), (cxp + 9 * RES, cyp), (cxp - 9 * RES, cyp)], fill=(232, 85, 63, 255))
    d.text((cxp, cyp - 64 * RES), 'N', font=font, fill=sand_c + (255,), anchor='ms')

    # true scale bar: 0-2-4 km
    km = 1000 / m_per_unit
    sx, sy = 70 * RES, 1110 * RES
    d.rectangle([sx, sy, sx + 2 * km * RES, sy + 6 * RES], fill=sand_c + (255,))
    d.rectangle([sx + 2 * km * RES, sy, sx + 4 * km * RES, sy + 6 * RES], outline=sand_c + (255,), width=3)
    for v, txt in [(0, '0'), (2, '2'), (4, '4 km')]:
        d.text((sx + v * km * RES, sy - 8 * RES), txt, font=font, fill=sand_c + (255,), anchor='ls' if v == 0 else 'ms')

    out = os.path.join(ROOT, 'assets', 'map-terrain.jpg')
    im.save(out, quality=84, optimize=True)
    print('wrote', out, im.size)

    # ------------------------------------------------------------- vectors
    def path_d(pts, close=False):
        P = [board(*p) for p in pts]
        if len(P) == 2:
            return f'M{P[0][0]:.1f} {P[0][1]:.1f} L{P[1][0]:.1f} {P[1][1]:.1f}'
        s = f'M{P[0][0]:.1f} {P[0][1]:.1f}'
        for i in range(len(P) - 1):
            p0 = P[max(i - 1, 0)]; p1 = P[i]; p2 = P[i + 1]; p3 = P[min(i + 2, len(P) - 1)]
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            s += f' C{c1[0]:.1f} {c1[1]:.1f}, {c2[0]:.1f} {c2[1]:.1f}, {p2[0]:.1f} {p2[1]:.1f}'
        return s

    # coast road: a ring ~250 m inside the main island's shore
    main_land = ndimage.binary_fill_holes(lab2 == np.argmax(np.bincount(lab2.ravel())[1:]) + 1)
    inner = ndimage.distance_transform_edt(main_land) / RES * m_per_unit
    ring = max(measure.find_contours(inner, 260), key=len)
    ring = measure.approximate_polygon(ring, tolerance=2.0 * RES)
    coast_road = 'M' + ' L'.join(f'{c / RES:.1f} {r / RES:.1f}' for r, c in ring) + ' Z'

    peak_iy, peak_ix = np.unravel_index(np.argmax(Eo), Eo.shape)
    peak = (peak_ix / RES, peak_iy / RES)

    lat_c = -4.68
    axis_a = board(-4.58, 55.445); axis_b = board(-4.78, 55.505)
    island_rot = math.degrees(math.atan2(axis_b[1] - axis_a[1], axis_b[0] - axis_a[0]))
    mid = board(-4.735, 55.478)

    geo = {
        'source': 'AWS Terrain Tiles (SRTM/GEBCO); stops and roads hand-placed',
        'metersPerUnit': round(m_per_unit, 3),
        'stops': {k: [round(c, 1) for c in board(*v)] for k, v in STOPS.items()},
        'legs': [path_d(l) for l in LEGS],
        'roads': [coast_road] + [path_d(r) for r in EXTRA_ROADS],
        'labels': [{'t': t, 'x': round(board(a, b)[0], 1), 'y': round(board(a, b)[1], 1), 'cls': c, 'rot': r}
                   for t, a, b, c, r in LABELS] + [
            {'t': '▲ Morne Seychellois', 'x': round(peak[0] + 6, 1), 'y': round(peak[1] - 4, 1), 'cls': 'lbl-peak', 'rot': 0},
            {'t': f'{int(round(Eo.max()))} m', 'x': round(peak[0] + 16, 1), 'y': round(peak[1] + 9, 1), 'cls': 'lbl-peak small', 'rot': 0},
            {'t': 'M A H É', 'x': round(mid[0], 1), 'y': round(mid[1], 1), 'cls': 'lbl-island', 'rot': round(island_rot, 1)},
            {'t': 'Indian Ocean', 'x': 90, 'y': 830, 'cls': 'lbl-sea', 'rot': 0},
            {'t': 'Indian Ocean', 'x': 720, 'y': 520, 'cls': 'lbl-sea', 'rot': 0},
        ],
    }
    js = '// Generated by tools/build_map.py from real elevation data. Do not edit by hand.\n' \
         'window.MAHE_GEO = ' + json.dumps(geo, ensure_ascii=False, indent=1) + ';\n'
    with open(os.path.join(ROOT, 'js', 'map-geo.js'), 'w') as f:
        f.write(js)
    print('wrote js/map-geo.js', f'{m_per_unit:.1f} m per board unit')


if __name__ == '__main__':
    main()
