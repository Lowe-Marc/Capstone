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

int * TestRunSim(Test* test)
{
	int tempVal[] = { -1 };
	if (test != nullptr)
	{
		return test->testRunSim();
	}
	return tempVal;
}

bool TestGetResults(Test* test, int handle[])
{
	if (test != nullptr)
	{
		return test->testGetResults(handle);
	}
	return false;
}

bool TestGetFrameCount(Test* test, int handle) 
{
	if (test != nullptr)
	{
		return test->getFrameCount(handle);
	}
	return false;
}

bool TestGetFrameSizes(Test* test, int handle[])
{
	if (test != nullptr)
	{
		return test->testGetResults(handle);
	}
	return false;
}