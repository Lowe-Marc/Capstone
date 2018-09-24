using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;


namespace Capstone.Models
{
    public class TestModel
    {
        [StructLayout(LayoutKind.Sequential)]
        public struct TestAnimationStruct
        {
            public int[][] frames;
        }

        private const string SIMULATIONS_DLL = "C:\\Users\\Marcus\\School\\Capstone\\Capstone\\Debug\\Capstone.Simulations.dll";

        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr CreateTest();

        [DllImport(SIMULATIONS_DLL)]
        static public extern void DeleteTest(IntPtr test);

        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr TestRunSim(IntPtr test);

        [DllImport(SIMULATIONS_DLL)]
        static public extern bool TestGetFrameCount(IntPtr test, int handle);

        [DllImport(SIMULATIONS_DLL)]
        static public extern IntPtr TestGetFrameSizes(IntPtr test, int[] handle);

        [DllImport(SIMULATIONS_DLL)]
        static public extern bool TestGetResults(IntPtr test, [MarshalAs(UnmanagedType.CustomMarshaler, MarshalTypeRef = typeof(JaggedArrayMarshaler))]int[][] structToAssign);
    }

    class JaggedArrayMarshaler : ICustomMarshaler
    {
        static ICustomMarshaler GetInstance(string cookie)
        {
            return new JaggedArrayMarshaler();
        }
        GCHandle[] handles;
        GCHandle buffer;
        Array[] array;
        public void CleanUpManagedData(object ManagedObj)
        {
        }
        public void CleanUpNativeData(IntPtr pNativeData)
        {
            buffer.Free();
            foreach (GCHandle handle in handles)
            {
                handle.Free();
            }
        }
        public int GetNativeDataSize()
        {
            return 4;
        }
        public IntPtr MarshalManagedToNative(object ManagedObj)
        {
            array = (Array[])ManagedObj;
            handles = new GCHandle[array.Length];
            for (int i = 0; i < array.Length; i++)
            {
                handles[i] = GCHandle.Alloc(array[i], GCHandleType.Pinned);
            }
            IntPtr[] pointers = new IntPtr[handles.Length];
            for (int i = 0; i < handles.Length; i++)
            {
                pointers[i] = handles[i].AddrOfPinnedObject();
            }
            buffer = GCHandle.Alloc(pointers, GCHandleType.Pinned);
            return buffer.AddrOfPinnedObject();
        }
        public object MarshalNativeToManaged(IntPtr pNativeData)
        {
            return array;
        }
    }
}