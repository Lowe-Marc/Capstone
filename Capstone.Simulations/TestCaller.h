#pragma once
#include "Test.h"

#ifdef __cplusplus
extern "C" {
#endif

	extern __declspec(dllexport) Test* CreateTest();
	extern __declspec(dllexport) void DeleteTest(Test* test);
	extern __declspec(dllexport) int TestRunSim(Test* test);
	extern __declspec(dllexport) bool TestGetResults(Test* test, int handle[]);


#ifdef __cplusplus
}
#endif