# Clic dans la fenetre du jeu. X/Y en coordonnees d'une capture 1920x1080 de la zone client.
param([int]$ProcId, [int]$X, [int]$Y, [switch]$Double)
Add-Type @"
using System; using System.Runtime.InteropServices;
public class W3 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(int f, int dx, int dy, int d, int e);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public struct RECT { public int L, T, R, B; }
  public struct POINT { public int X, Y; }
}
"@
[W3]::SetProcessDPIAware() | Out-Null
$h = (Get-Process -Id $ProcId).MainWindowHandle
[W3]::SetForegroundWindow($h) | Out-Null; Start-Sleep -Milliseconds 400
$r = New-Object W3+RECT; [W3]::GetClientRect($h, [ref]$r) | Out-Null
$p = New-Object W3+POINT; [W3]::ClientToScreen($h, [ref]$p) | Out-Null
$sx = $p.X + [int]($X * ($r.R - $r.L) / 1920); $sy = $p.Y + [int]($Y * ($r.B - $r.T) / 1080)
[W3]::SetCursorPos($sx, $sy) | Out-Null; Start-Sleep -Milliseconds 200
$n = 1; if ($Double) { $n = 2 }
for ($i = 0; $i -lt $n; $i++) { [W3]::mouse_event(2, 0, 0, 0, 0); Start-Sleep -Milliseconds 60; [W3]::mouse_event(4, 0, 0, 0, 0); Start-Sleep -Milliseconds 120 }
"clic ecran $sx,$sy"
