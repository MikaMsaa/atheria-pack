# Capture la fenetre du jeu (PID donne), la met au premier plan et l'enregistre en PNG 1920x1080.
param([int]$ProcId, [string]$Sortie, [switch]$Maximiser)
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public class W32 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public struct RECT { public int L, T, R, B; }
  public struct POINT { public int X, Y; }
}
"@
[W32]::SetProcessDPIAware() | Out-Null
$h = (Get-Process -Id $ProcId).MainWindowHandle
if ($Maximiser) { [W32]::ShowWindow($h, 3) | Out-Null; Start-Sleep 3 }
[W32]::SetForegroundWindow($h) | Out-Null
Start-Sleep 2
$r = New-Object W32+RECT; [W32]::GetClientRect($h, [ref]$r) | Out-Null
$p = New-Object W32+POINT; [W32]::ClientToScreen($h, [ref]$p) | Out-Null
$w = $r.R - $r.L; $ht = $r.B - $r.T
$bmp = New-Object Drawing.Bitmap $w, $ht
$g = [Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($p.X, $p.Y, 0, 0, (New-Object Drawing.Size $w, $ht)); $g.Dispose()
$out = New-Object Drawing.Bitmap 1920, 1080
$g2 = [Drawing.Graphics]::FromImage($out); $g2.InterpolationMode = 'HighQualityBicubic'; $g2.DrawImage($bmp, 0, 0, 1920, 1080); $g2.Dispose()
$out.Save($Sortie, [Drawing.Imaging.ImageFormat]::Png)
"capture {0}x{1} -> 1920x1080 : {2}" -f $w, $ht, $Sortie
