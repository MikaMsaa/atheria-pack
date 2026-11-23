"""Titre d'entree en blocs 3D (facon logo Minecraft, oeuvre originale), rendu Blender, fond transparent.
blender -b --factory-startup -P blender_titre.py -- <id> <sortie.png|sortie.blend> [largeur]  (.blend = scene sans rendu)
Lettres = voxels (police en blocs 5x7 maison), biseau, matiere procedurale et ornement propres au lieu.
"""
import bpy, bmesh, math, random, sys, unicodedata
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
IDENT, SORTIE = argv[0], argv[1]
LARG = int(argv[2]) if len(argv) > 2 else 1800

G = {
 'A': ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], 'B': ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
 'C': ["01111", "10000", "10000", "10000", "10000", "10000", "01111"], 'D': ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
 'E': ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], 'F': ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
 'G': ["01111", "10000", "10000", "10011", "10001", "10001", "01111"], 'H': ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
 'I': ["111", "010", "010", "010", "010", "010", "111"], 'J': ["00111", "00001", "00001", "00001", "10001", "10001", "01110"],
 'K': ["10001", "10010", "10100", "11000", "10100", "10010", "10001"], 'L': ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
 'M': ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], 'N': ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
 'O': ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], 'P': ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
 'Q': ["01110", "10001", "10001", "10001", "10101", "10010", "01101"], 'R': ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
 'S': ["01111", "10000", "10000", "01110", "00001", "00001", "11110"], 'T': ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
 'U': ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], 'V': ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
 'W': ["10001", "10001", "10001", "10101", "10101", "11011", "10001"], 'X': ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
 'Y': ["10001", "10001", "01010", "00100", "00100", "00100", "00100"], 'Z': ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
 "'": ["1", "1", "0", "0", "0", "0", "0"], '-': ["000", "000", "000", "111", "000", "000", "000"], ' ': ["00", "00", "00", "00", "00", "00", "00"],
}
ACC = {'́': ["00010", "00100"], '̀': ["01000", "00100"], '̂': ["00100", "01010"]}

FICHES = {
 'ville_longoni': {'lignes': ["LONGONI"], 'mat': 'rouille', 'orn': 'barbeles'},
 'region_plaine_cendres': {'lignes': ["PLAINE", "DE CENDRES"], 'mat': 'cendre', 'orn': 'braises'},
 'region_sommet_benara': {'lignes': ["SOMMET GELÉ", "DU BÉNARA"], 'mat': 'glace', 'orn': 'givre'},
}
F = FICHES[IDENT]
rng = random.Random(IDENT)


def glyphe(ch):
    d = unicodedata.normalize('NFD', ch)
    g = G.get(d[0], G[' ']); w = len(g[0]); acc = ["0" * w, "0" * w]
    for mk in d[1:]:
        if mk in ACC: acc = ACC[mk] if w == 5 else [r[1:4] for r in ACC[mk]]
    return acc + g, w


def voxels(lignes):
    """ensemble (x, z) des blocs ; lignes centrees ; z vers le haut"""
    vox, larg = set(), []
    for l in lignes: larg.append(sum(glyphe(c)[1] + 1 for c in l) - 1)
    W = max(larg)
    for k, l in enumerate(lignes):
        x0 = (W - larg[k]) // 2
        zb = (len(lignes) - 1 - k) * 11
        for c in l:
            g, w = glyphe(c)
            for yy, row in enumerate(g):
                for xx, v in enumerate(row):
                    if v == '1': vox.add((x0 + xx, zb + 8 - yy))
            x0 += w + 1
    return vox, W


def maillage(vox, D=1.6):
    """surface des voxels (faces exterieures seulement) -> biseau propre"""
    bm = bmesh.new(); vc = {}
    def v(p):
        if p not in vc: vc[p] = bm.verts.new(p)
        return vc[p]
    for (x, z) in vox:
        X0, X1, Z0, Z1, Y0, Y1 = x, x + 1, z, z + 1, 0.0, D
        bm.faces.new([v((X0, Y0, Z0)), v((X1, Y0, Z0)), v((X1, Y0, Z1)), v((X0, Y0, Z1))])  # avant (y=0, face a la camera)
        bm.faces.new([v((X0, Y1, Z0)), v((X0, Y1, Z1)), v((X1, Y1, Z1)), v((X1, Y1, Z0))])
        if (x - 1, z) not in vox: bm.faces.new([v((X0, Y0, Z0)), v((X0, Y0, Z1)), v((X0, Y1, Z1)), v((X0, Y1, Z0))])
        if (x + 1, z) not in vox: bm.faces.new([v((X1, Y0, Z0)), v((X1, Y1, Z0)), v((X1, Y1, Z1)), v((X1, Y0, Z1))])
        if (x, z - 1) not in vox: bm.faces.new([v((X0, Y0, Z0)), v((X0, Y1, Z0)), v((X1, Y1, Z0)), v((X1, Y0, Z0))])
        if (x, z + 1) not in vox: bm.faces.new([v((X0, Y0, Z1)), v((X1, Y0, Z1)), v((X1, Y1, Z1)), v((X0, Y1, Z1))])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('lettres'); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('lettres', me); bpy.context.collection.objects.link(ob)
    bv = ob.modifiers.new('biseau', 'BEVEL'); bv.width = 0.09; bv.segments = 2; bv.limit_method = 'ANGLE'
    for p in me.polygons: p.use_smooth = False
    return ob


# ------------------------------------------------------------------ matieres
def mat_nodes(nom):
    m = bpy.data.materials.new(nom); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    bsdf = N['Principled BSDF']
    return m, nt, N, L, bsdf


def mat_rouille():
    m, nt, N, L, b = mat_nodes('tole_rouillee')
    tc = N.new('ShaderNodeTexCoord')
    # tole ondulee : ondes le long de x, bump
    wave = N.new('ShaderNodeTexWave'); wave.inputs['Scale'].default_value = 1.6; wave.bands_direction = 'X'
    L.new(tc.outputs['Object'], wave.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 2.2; no.inputs['Detail'].default_value = 8
    L.new(tc.outputs['Object'], no.inputs['Vector'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.42; cr.color_ramp.elements[1].position = 0.62
    cr.color_ramp.elements[0].color = (0.30, 0.31, 0.32, 1); cr.color_ramp.elements[1].color = (0.42, 0.13, 0.03, 1)
    e = cr.color_ramp.elements.new(0.8); e.color = (0.62, 0.27, 0.07, 1)
    L.new(no.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Metallic'].default_value = 0.55; b.inputs['Roughness'].default_value = 0.75
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.35
    mx = N.new('ShaderNodeMath'); mx.operation = 'ADD'
    L.new(wave.outputs['Fac'], mx.inputs[0]); L.new(no.outputs['Fac'], mx.inputs[1]); L.new(mx.outputs[0], bp.inputs['Height'])
    L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_cendre():
    m, nt, N, L, b = mat_nodes('cendre_braise')
    tc = N.new('ShaderNodeTexCoord')
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 3.5; no.inputs['Detail'].default_value = 10
    L.new(tc.outputs['Object'], no.inputs['Vector'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (0.05, 0.05, 0.05, 1); cr.color_ramp.elements[1].color = (0.32, 0.31, 0.30, 1)
    L.new(no.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.95
    # fissures incandescentes : bords de Voronoi
    vo = N.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = 1.4
    L.new(tc.outputs['Object'], vo.inputs['Vector'])
    seuil = N.new('ShaderNodeMath'); seuil.operation = 'LESS_THAN'; seuil.inputs[1].default_value = 0.035
    L.new(vo.outputs['Distance'], seuil.inputs[0])
    L.new(seuil.outputs[0], b.inputs['Emission Strength'])
    b.inputs['Emission Color'].default_value = (1.0, 0.33, 0.05, 1)
    # le multiplicateur d'emission
    em = N.new('ShaderNodeMath'); em.operation = 'MULTIPLY'; em.inputs[1].default_value = 9.0
    L.new(seuil.outputs[0], em.inputs[0]); L.new(em.outputs[0], b.inputs['Emission Strength'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.5
    L.new(no.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_glace():
    m, nt, N, L, b = mat_nodes('glace_neige')
    b.inputs['Transmission Weight'].default_value = 0.55; b.inputs['IOR'].default_value = 1.31; b.inputs['Roughness'].default_value = 0.12
    geo = N.new('ShaderNodeNewGeometry'); sep = N.new('ShaderNodeSeparateXYZ')
    L.new(geo.outputs['Normal'], sep.inputs['Vector'])
    no = N.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 5
    tc = N.new('ShaderNodeTexCoord'); L.new(tc.outputs['Object'], no.inputs['Vector'])
    # neige sur les faces du dessus
    add = N.new('ShaderNodeMath'); add.operation = 'ADD'
    L.new(sep.outputs['Z'], add.inputs[0]); mulno = N.new('ShaderNodeMath'); mulno.operation = 'MULTIPLY'; mulno.inputs[1].default_value = 0.3
    L.new(no.outputs['Fac'], mulno.inputs[0]); L.new(mulno.outputs[0], add.inputs[1])
    gt = N.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.85
    L.new(add.outputs[0], gt.inputs[0])
    mixc = N.new('ShaderNodeMix'); mixc.data_type = 'RGBA'
    mixc.inputs[6].default_value = (0.55, 0.78, 0.95, 1); mixc.inputs[7].default_value = (0.96, 0.98, 1.0, 1)
    L.new(gt.outputs[0], mixc.inputs[0]); L.new(mixc.outputs[2], b.inputs['Base Color'])
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 0.55
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0.55
    L.new(gt.outputs[0], mul.inputs[0]); L.new(mul.outputs[0], inv.inputs[1]); L.new(inv.outputs[0], b.inputs['Transmission Weight'])
    rmix = N.new('ShaderNodeMath'); rmix.operation = 'MULTIPLY_ADD'; rmix.inputs[1].default_value = 0.75; rmix.inputs[2].default_value = 0.1
    L.new(gt.outputs[0], rmix.inputs[0]); L.new(rmix.outputs[0], b.inputs['Roughness'])
    vo = N.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 2.5; L.new(tc.outputs['Object'], vo.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.25
    L.new(vo.outputs['Distance'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_simple(nom, c, metal=0.0, rough=0.5, em=None, ems=0.0):
    m, nt, N, L, b = mat_nodes(nom)
    b.inputs['Base Color'].default_value = c; b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if em: b.inputs['Emission Color'].default_value = em; b.inputs['Emission Strength'].default_value = ems
    return m


# ------------------------------------------------------------------ ornements
def barbeles(W, H, D):
    fer = mat_simple('fer', (0.18, 0.17, 0.16, 1), 0.9, 0.45)
    for zc in (H * 0.32, H * 0.72):
        cu = bpy.data.curves.new('fil', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.07; cu.bevel_resolution = 2
        sp = cu.splines.new('POLY'); n = int(W * 6)
        sp.points.add(n - 1)
        for i in range(n):
            t = i / 6.0
            sp.points[i].co = (-1.5 + t * (W + 3) / W * 1.0, -0.35 + 0.25 * math.sin(t * 2.1), zc + 0.35 * math.sin(t * 1.3 + zc), 1)
        ob = bpy.data.objects.new('fil', cu); bpy.context.collection.objects.link(ob); ob.data.materials.append(fer)
        # barbes
        for k in range(int(W / 1.6)):
            t = k * 1.6 + 0.4
            x, y, z = -1.5 + t, -0.35 + 0.25 * math.sin(t * 6 * 2.1 / 6), zc + 0.35 * math.sin(t * 1.3 + zc)
            for a in (35, -35):
                bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.6, location=(x, y, z), rotation=(math.radians(a), math.radians(a * 1.5), 0))
                bpy.context.object.data.materials.append(fer)


def braises(W, H, D):
    br = mat_simple('braise', (1, 0.4, 0.1, 1), em=(1.0, 0.38, 0.06, 1), ems=14.0)
    for _ in range(90):
        x = rng.uniform(-1, W + 1); z = rng.uniform(-1.5, H + 3.5); y = rng.uniform(-1.5, 0.2)
        bpy.ops.mesh.primitive_cube_add(size=rng.uniform(0.08, 0.22), location=(x, y, z), rotation=(rng.random(), rng.random(), rng.random()))
        bpy.context.object.data.materials.append(br)
    # tas de cendre sous les lettres
    ce = mat_simple('tas', (0.12, 0.115, 0.11, 1), 0, 0.98)
    for i in range(int(W * 1.5)):
        x = i / 1.5
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, D / 2, -0.35 - rng.random() * 0.3), scale=(0.45, D * 0.7, 0.3 + rng.random() * 0.25))
        bpy.context.object.data.materials.append(ce)


def givre(W, H, D, vox):
    gl = mat_simple('stalactite', (0.75, 0.9, 1.0, 1), 0, 0.08)
    gl.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = 0.7
    # stalactites sous les blocs dont le dessous est libre
    for (x, z) in vox:
        if (x, z - 1) not in vox and rng.random() < 0.45:
            L = rng.uniform(0.4, 1.4)
            bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.16, radius2=0.0, depth=L, location=(x + rng.uniform(0.25, 0.75), rng.uniform(0.15, 0.5), z - L / 2))
            bpy.context.object.rotation_euler = (math.pi, 0, 0); bpy.context.object.data.materials.append(gl)
    fl = mat_simple('flocon', (1, 1, 1, 1), 0, 0.3, em=(0.9, 0.95, 1, 1), ems=1.5)
    for _ in range(70):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=rng.uniform(0.04, 0.1), location=(rng.uniform(-1, W + 1), rng.uniform(-2, 0), rng.uniform(-1, H + 3)))
        bpy.context.object.data.materials.append(fl)


# ------------------------------------------------------------------ scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
vox, W = voxels(F['lignes'])
H = max(z for _, z in vox) + 1
D = 1.6
ob = maillage(vox, D)
ob.data.materials.append({'rouille': mat_rouille, 'cendre': mat_cendre, 'glace': mat_glace}[F['mat']]())
if F['orn'] == 'barbeles': barbeles(W, H, D)
elif F['orn'] == 'braises': braises(W, H, D)
elif F['orn'] == 'givre': givre(W, H, D, vox)

# camera orthographique, vue 3/4 par en dessous
cx, cz = W / 2.0, H / 2.0
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (cx - 14, -40, cz - 16)
dirv = Vector((cx, D / 2, cz)) - co.location
co.rotation_euler = dirv.to_track_quat('-Z', 'Y').to_euler()
cam.ortho_scale = W * 1.12
# lumieres douces
def lum(nom, typ, loc, e, couleur=(1, 1, 1), taille=6):
    l = bpy.data.lights.new(nom, typ); l.energy = e; l.color = couleur
    if typ == 'AREA': l.size = taille
    o = bpy.data.objects.new(nom, l); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((cx, D / 2, cz)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
lum('cle', 'AREA', (cx - 18, -22, cz + 22), 9000, taille=14)
lum('remplissage', 'AREA', (cx + 22, -18, cz - 6), 2500, (0.8, 0.88, 1.0), 14)
lum('contre', 'AREA', (cx + 4, 20, cz + 14), 7000, (1.0, 0.92, 0.8), 10)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.05, 0.06, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6

sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.film_transparent = True
sc.render.resolution_x = LARG
sc.render.resolution_y = int(LARG * (H + 6) / (W * 1.12) )
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try:
    sc.eevee.taa_render_samples = 64
    sc.eevee.use_bloom = True
except Exception:
    pass
sc.view_settings.view_transform = 'AgX' if 'AgX' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
if SORTIE.lower().endswith('.blend'):
    # scene et matieres preparees SANS rendu (rendu plus tard, sous verrou)
    sc.render.filepath = SORTIE[:-6] + '.png'
    bpy.ops.wm.save_as_mainfile(filepath=SORTIE)
    print('SCENE_OK', SORTIE, sc.render.resolution_x, sc.render.resolution_y, len(bpy.data.objects), 'objets', len(bpy.data.materials), 'matieres')
else:
    sc.render.filepath = SORTIE
    bpy.ops.render.render(write_still=True)
    print('TITRE_OK', SORTIE, sc.render.resolution_x, sc.render.resolution_y)
