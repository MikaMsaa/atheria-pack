# Atheria Zombie Edition - menu principal facon The Last of Us (FancyMenu)
# Sources : outils\menu\icone-source.png et fond-source.png
# Produit dans pack\ et instances\Atheria\minecraft : images de config\fancymenu\assets,
# config\fancymenu\customization\title_screen_layout.txt, icon.png

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$Sortie = Join-Path $env:TEMP "atheria-menu-$([guid]::NewGuid())"
New-Item -ItemType Directory -Force $Sortie | Out-Null

function Redimensionner($Source, $Cible, [int]$Taille) {
    $b = New-Object Drawing.Bitmap $Taille, $Taille
    $g = [Drawing.Graphics]::FromImage($b)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($Source, 0, 0, $Taille, $Taille)
    $g.Dispose(); $b.Save($Cible, [Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}

# Icones
$icone = [Drawing.Image]::FromFile((Join-Path $Ici 'icone-source.png'))
Redimensionner $icone (Join-Path $Sortie 'icon.png') 512
Redimensionner $icone (Join-Path $Sortie 'atheria_icone_32.png') 32
Redimensionner $icone (Join-Path $Sortie 'atheria_icone_16.png') 16

# Logo fourni par Mika, fond deja transparent
$logoSrc = [Drawing.Image]::FromFile((Join-Path $Ici 'logo-source.png'))
$logo = New-Object Drawing.Bitmap 1086, 362, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [Drawing.Graphics]::FromImage($logo)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($logoSrc, 0, 0, 1086, 362)
$g.Dispose(); $logoSrc.Dispose()
$logo.Save((Join-Path $Sortie 'atheria_logo.png'), [Drawing.Imaging.ImageFormat]::Png)
$logo.Dispose(); $icone.Dispose()

# Style des autres menus : boutons et panneaux sombres, surlignes en ambre comme sur l'accueil
$Gui = Join-Path $Sortie 'gui'
New-Item -ItemType Directory -Force (Join-Path $Gui 'sprites\widget') | Out-Null
function Sprite($Chemin, [int]$L, [int]$H, $Fond, $Trait, [int]$Bord) {
    $b = New-Object Drawing.Bitmap $L, $H, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($b)
    $g.Clear($Fond)
    if ($Trait) {
        $s = New-Object Drawing.SolidBrush $Trait
        $g.FillRectangle($s, 0, 0, $L, 1); $g.FillRectangle($s, 0, $H - 1, $L, 1)
        $g.FillRectangle($s, 0, 0, $Bord, $H); $g.FillRectangle($s, $L - 1, 0, 1, $H)
    }
    $g.Dispose(); $b.Save((Join-Path $Gui "$Chemin.png"), [Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
    $json = '{"gui":{"scaling":{"type":"nine_slice","width":' + $L + ',"height":' + $H + ',"border":{"left":' + $Bord + ',"top":1,"right":1,"bottom":1}}}}'
    [IO.File]::WriteAllText((Join-Path $Gui "$Chemin.png.mcmeta"), $json, (New-Object Text.UTF8Encoding $false))
}
$fondBouton = [Drawing.Color]::FromArgb(150, 12, 12, 10)
$traitBouton = [Drawing.Color]::FromArgb(110, 230, 225, 215)
$fondSurvol = [Drawing.Color]::FromArgb(190, 45, 28, 12)
$ambre = [Drawing.Color]::FromArgb(255, 245, 170, 90)
$fondInactif = [Drawing.Color]::FromArgb(90, 12, 12, 10)
$traitInactif = [Drawing.Color]::FromArgb(50, 230, 225, 215)
Sprite 'sprites\widget\button' 200 20 $fondBouton $traitBouton 1
Sprite 'sprites\widget\button_highlighted' 200 20 $fondSurvol $ambre 3
Sprite 'sprites\widget\button_disabled' 200 20 $fondInactif $traitInactif 1
Sprite 'sprites\widget\slider' 200 20 $fondBouton $traitBouton 1
Sprite 'sprites\widget\slider_highlighted' 200 20 $fondSurvol $ambre 1
Sprite 'sprites\widget\slider_handle' 8 20 ([Drawing.Color]::FromArgb(230, 230, 225, 215)) $null 1
Sprite 'sprites\widget\slider_handle_highlighted' 8 20 $ambre $null 1
Sprite 'sprites\widget\text_field' 200 20 ([Drawing.Color]::FromArgb(190, 8, 8, 7)) $traitBouton 1
Sprite 'sprites\widget\text_field_highlighted' 200 20 ([Drawing.Color]::FromArgb(210, 8, 8, 7)) $ambre 1
# Panneaux de liste : voile sombre sur le fond, sans le motif de terre
foreach ($nom in 'menu_list_background', 'menu_background', 'inworld_menu_list_background', 'inworld_menu_background') {
    $b = New-Object Drawing.Bitmap 32, 32, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($b); $g.Clear([Drawing.Color]::FromArgb(120, 8, 8, 7)); $g.Dispose()
    $b.Save((Join-Path $Gui "$nom.png"), [Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}
foreach ($nom in 'header_separator', 'footer_separator', 'inworld_header_separator', 'inworld_footer_separator') {
    $b = New-Object Drawing.Bitmap 32, 2, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($b); $g.Clear([Drawing.Color]::FromArgb(90, 230, 225, 215)); $g.Dispose()
    $b.Save((Join-Path $Gui "$nom.png"), [Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}

# Fond : on efface PRESS ANY BUTTON en recopiant le mur juste en dessous
$fondSrc = [Drawing.Image]::FromFile((Join-Path $Ici 'fond-source.png'))
$fond = New-Object Drawing.Bitmap $fondSrc
$g = [Drawing.Graphics]::FromImage($fond)
$g.DrawImage($fondSrc, (New-Object Drawing.Rectangle 90, 380, 370, 60), (New-Object Drawing.Rectangle 90, 450, 370, 60), 'Pixel')
$g.Dispose(); $fondSrc.Dispose()
$fond.Save((Join-Path $Sortie 'atheria_fond_menu.png'), [Drawing.Imaging.ImageFormat]::Png); $fond.Dispose()

# Libelles du menu, en images pour les aligner a gauche et choisir la police
function Libelle($Texte, $Nom, $Couleur) {
    $b = New-Object Drawing.Bitmap 480, 64, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [Drawing.Graphics]::FromImage($b)
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $police = New-Object Drawing.Font 'Bahnschrift Light', 38, ([Drawing.FontStyle]::Regular), ([Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($Texte, $police, (New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(170, 0, 0, 0))), 3, 7)
    $g.DrawString($Texte, $police, (New-Object Drawing.SolidBrush $Couleur), 0, 4)
    $g.Dispose(); $b.Save((Join-Path $Sortie "atheria_menu_$Nom.png"), [Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}
$boutons = @(
    @{ id = 'mc_titlescreen_singleplayer_button'; texte = 'SOLO';        nom = 'solo' },
    @{ id = 'mc_titlescreen_multiplayer_button';  texte = 'MULTIJOUEUR'; nom = 'multi' },
    @{ id = 'mc_titlescreen_options_button';      texte = 'OPTIONS';     nom = 'options' },
    @{ id = 'mc_titlescreen_quit_button';         texte = 'QUITTER';     nom = 'quitter' }
)
foreach ($b in $boutons) {
    Libelle $b.texte $b.nom ([Drawing.Color]::FromArgb(235, 230, 225, 215))
    Libelle $b.texte "$($b.nom)_survol" ([Drawing.Color]::FromArgb(255, 245, 170, 90))
}
# APPARENCE ouvre la garde-robe Essential : bouton ajoute par kubejs/client_scripts/atheria_menu.js
Libelle 'APPARENCE' 'apparence' ([Drawing.Color]::FromArgb(235, 230, 225, 215))
Libelle 'APPARENCE' 'apparence_survol' ([Drawing.Color]::FromArgb(255, 245, 170, 90))

# Layout FancyMenu
function Uuid($Graine) {
    $md5 = [Security.Cryptography.MD5]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($Graine))
    return ([guid]::new($md5)).ToString() + '-1767966184383'
}
function Commun($Id, $Ancre, $X, $Y, $W, $H) {
    $req = Uuid "req-$Id"
    return @"
  instance_identifier = $Id
  appearance_delay = no_delay
  appearance_delay_seconds = 1.0
  fade_in_v2 = no_fading
  fade_in_speed = 1.0
  fade_out = no_fading
  fade_out_speed = 1.0
  base_opacity = 1.0
  auto_sizing = false
  auto_sizing_base_screen_width = 0
  auto_sizing_base_screen_height = 0
  sticky_anchor = false
  anchor_point = $Ancre
  x = $X
  y = $Y
  width = $W
  height = $H
  stretch_x = false
  stretch_y = false
  stay_on_screen = true
  element_loading_requirement_container_identifier = $req
  [loading_requirement_container_meta:$req] = [groups:][instances:]
  enable_parallax = false
  parallax_intensity_v2 = 0.5
  invert_parallax = false
  animated_offset_x = 0
  animated_offset_y = 0
  load_once_per_session = false
  in_editor_color = #FFC800FF
  layer_hidden_in_editor = false
  rotation_degrees = 0.0
  advanced_rotation_mode = false
  vertical_tilt_degrees = 0.0
  advanced_vertical_tilt_mode = false
  horizontal_tilt_degrees = 0.0
  advanced_horizontal_tilt_mode = false
"@
}
function Bouton($Id, $Y, $Nom, [bool]$Cache) {
    $bloc = Uuid "bloc-$Id"; $actif = Uuid "actif-$Id"
    $fonds = ''
    if (-not $Cache) {
        $fonds = @"
  backgroundnormal = [source:local]/config/fancymenu/assets/atheria_menu_$Nom.png
  backgroundhovered = [source:local]/config/fancymenu/assets/atheria_menu_${Nom}_survol.png
  label = §r
"@
    }
    return @"
vanilla_button {
  button_element_executable_block_identifier = $bloc
  [executable_block:$bloc][type:generic] = [executables:]
  restartbackgroundanimations = true
  nine_slice_custom_background = false
  nine_slice_border_x = 5
  nine_slice_border_y = 5
$fonds
  navigatable = true
  widget_active_state_requirement_container_identifier = $actif
  [loading_requirement_container_meta:$actif] = [groups:][instances:]
  is_template = false
  template_apply_width = false
  template_apply_height = false
  template_apply_posx = false
  template_apply_posy = false
  template_apply_opacity = false
  template_apply_visibility = false
  template_apply_label = false
  template_share_with = buttons
  nine_slice_slider_handle = false
  nine_slice_slider_handle_border_x = 5
  nine_slice_slider_handle_border_y = 5
  element_type = vanilla_button
$(Commun $Id 'mid-left' 44 $Y 120 16)
  is_hidden = $($Cache.ToString().ToLower())
  automated_button_clicks = 0
}

"@
}
$req = Uuid 'layout'
$bg = Uuid 'fond'
$logoReq = Uuid 'logo'
$texte = @"
type = fancymenu_layout

layout-meta {
  identifier = title_screen
  render_custom_elements_behind_vanilla = false
  last_edited_time = 1767966200773
  is_enabled = true
  randommode = false
  randomgroup = 1
  randomonlyfirsttime = false
  layout_index = 0
  custom_menu_title = Atheria Zombie Edition
  [loading_requirement_container_meta:$req] = [groups:][instances:]
}

menu_background {
  image_path = [source:local]/config/fancymenu/assets/atheria_fond_menu.png
  slide = false
  repeat_texture = false
  parallax = false
  parallax_intensity = 0.02
  invert_parallax = false
  restart_animated_on_menu_load = false
  instance_identifier = $bg
  background_type = image
}

customization {
  action = backgroundoptions
  keepaspectratio = false
}

scroll_list_customization {
  preserve_scroll_list_header_footer_aspect_ratio = true
  render_scroll_list_header_shadow = true
  render_scroll_list_footer_shadow = true
  show_scroll_list_header_footer_preview_in_editor = false
  repeat_scroll_list_header_texture = false
  repeat_scroll_list_footer_texture = false
  show_screen_background_overlay_on_custom_background = false
  apply_vanilla_background_blur = false
}

layout_action_executable_blocks {
}

element {
  source = [source:local]/config/fancymenu/assets/atheria_logo.png
  repeat_texture = false
  nine_slice_texture = false
  nine_slice_texture_border_x = 5
  nine_slice_texture_border_y = 5
  image_tint = #FFFFFF
  restart_animated_on_menu_load = false
  element_type = image
$(Commun $logoReq 'mid-left' 30 -112 228 76)
}


"@
$y = -30
foreach ($b in $boutons) {
    $texte += Bouton $b.id $y $b.nom $false
    $y += 20
    if ($b.nom -eq 'multi') { $y += 20 } # la place d'APPARENCE
}
foreach ($id in 'mc_titlescreen_realms_button','mc_titlescreen_language_button','mc_titlescreen_accessibility_button','forge_titlescreen_mods_button','mc_titlescreen_playdemo_button','minecraft_logo_widget','minecraft_splash_widget','minecraft_branding_widget','title_screen_realms_notification') {
    $texte += Bouton $id 0 '' $true
}
[IO.File]::WriteAllText((Join-Path $Sortie 'title_screen_layout.txt'), $texte, (New-Object Text.UTF8Encoding $false))

# Copies
foreach ($Base in (Join-Path $Root 'pack'), (Join-Path $Root 'instances\Atheria\minecraft')) {
    $assets = Join-Path $Base 'config\fancymenu\assets'
    $custom = Join-Path $Base 'config\fancymenu\customization'
    New-Item -ItemType Directory -Force $assets, $custom | Out-Null
    Get-ChildItem $Sortie -Filter 'atheria_*.png' | Copy-Item -Destination $assets -Force
    Copy-Item (Join-Path $Sortie 'title_screen_layout.txt') $custom -Force
    Copy-Item (Join-Path $Sortie 'icon.png') $Base -Force
    # Textures de jeu : le fond pour les autres menus, et le style des boutons et panneaux
    $texAtheria = Join-Path $Base 'kubejs\assets\atheria\textures\gui'
    $texMc = Join-Path $Base 'kubejs\assets\minecraft\textures\gui'
    New-Item -ItemType Directory -Force $texAtheria, $texMc | Out-Null
    Copy-Item (Join-Path $Sortie 'atheria_fond_menu.png') (Join-Path $texAtheria 'fond_menu.png') -Force
    New-Item -ItemType Directory -Force (Join-Path $texAtheria 'sprites') | Out-Null
    Copy-Item (Join-Path $Sortie 'atheria_menu_apparence.png') (Join-Path $texAtheria 'sprites\menu_apparence.png') -Force
    Copy-Item (Join-Path $Sortie 'atheria_menu_apparence_survol.png') (Join-Path $texAtheria 'sprites\menu_apparence_survol.png') -Force
    Copy-Item (Join-Path $Gui '*') $texMc -Recurse -Force
}
Remove-Item $Sortie -Recurse -Force
Write-Host 'Menu construit.'
