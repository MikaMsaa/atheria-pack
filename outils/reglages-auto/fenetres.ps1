param([string]$Titre="Atheria",[int]$Secondes=120)
# Attend une fenêtre visible dont le titre contient $Titre (hors fenêtres de jeu « Atheria Zombie Edition »), puis dit si elle est au premier plan
Add-Type @"
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public class EW { public delegate bool CB(IntPtr h, IntPtr l); [DllImport("user32.dll")] public static extern bool EnumWindows(CB cb, IntPtr l); [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p); [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n); [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h); [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r); public struct RECT { public int L,T,R,B; }
 public static List<string> F(string t){ var res=new List<string>(); IntPtr fg=GetForegroundWindow(); EnumWindows((h,l)=>{ if(!IsWindowVisible(h)) return true; var sb=new StringBuilder(256); GetWindowText(h,sb,256); string s=sb.ToString(); if(s.Contains(t) && s!="Atheria Zombie Edition"){ uint p; GetWindowThreadProcessId(h,out p); RECT r; GetWindowRect(h,out r); res.Add(h+";"+p+";"+s+";"+(h==fg)+";"+r.L+","+r.T+","+r.R+","+r.B);} return true;}, IntPtr.Zero); return res; } }
"@
$fin=(Get-Date).AddSeconds($Secondes)
while((Get-Date) -lt $fin){ $r=[EW]::F($Titre); if($r.Count){ $r; break }; Start-Sleep -Milliseconds 500 }
