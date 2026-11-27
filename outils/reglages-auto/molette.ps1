param([int]$ProcId,[int]$X,[int]$Y,[int]$Crans=5)
Add-Type @"
using System; using System.Runtime.InteropServices;
public class M8 { [DllImport("user32.dll")] public static extern void mouse_event(uint f, int x, int y, int d, UIntPtr e); [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y); [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h,out R r); [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h,ref P p); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); public struct R{public int L,T,Ri,B;} public struct P{public int X,Y;} }
"@
$h=(Get-Process -Id $ProcId).MainWindowHandle; [M8]::SetForegroundWindow($h)|Out-Null; $r=New-Object M8+R; [M8]::GetClientRect($h,[ref]$r)|Out-Null; $p=New-Object M8+P; $p.X=[int]($X*$r.Ri/1920); $p.Y=[int]($Y*$r.B/1080); [M8]::ClientToScreen($h,[ref]$p)|Out-Null; [M8]::SetCursorPos($p.X,$p.Y)|Out-Null; Start-Sleep -Milliseconds 200
$d = if($Crans -lt 0){120}else{-120}; for($i=0;$i -lt [Math]::Abs($Crans);$i++){[M8]::mouse_event(0x0800,0,0,$d,[UIntPtr]::Zero); Start-Sleep -Milliseconds 120}
