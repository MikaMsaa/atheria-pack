using System; using System.Runtime.InteropServices;
public class K4 { [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint c, uint t);
public static void Tape(byte vk){ byte s=(byte)MapVirtualKey(vk,0); keybd_event(vk,s,0,UIntPtr.Zero); System.Threading.Thread.Sleep(60); keybd_event(vk,s,2,UIntPtr.Zero); System.Threading.Thread.Sleep(60);} }
