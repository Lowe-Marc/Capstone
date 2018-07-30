#include "TestCaller.h"
#include "stdafx.h"


Test* CreateTest()
{
	return new Test();
}

void DeleteTest(Test* test)
{
	if (test != nullptr)
	{
		delete test;
		test = nullptr;
	}
}

int TestRunSim(Test* test)
{
	if (test != nullptr)
	{
		return test->testRunSim();
	}
	return -1;
}

bool TestGetResults(Test* test, AnimationsStruct* handle)
{
	if (test != nullptr)
	{
		return test->testGetResults(handle);
	}
	return false;
}