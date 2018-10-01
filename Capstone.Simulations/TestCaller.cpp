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

int TestGetFrameCount(Test* test) 
{
	if (test != nullptr)
	{
		return test->getFrameCount();
	}
	return false;
}

bool TestGetFrameSizes(Test* test, int handle[])
{
	if (test != nullptr)
	{
		return test->getFrameSizes(handle);
	}
	return false;
}

bool TestGetResults(Test* test, int ** handle)
{
	if (test != nullptr)
	{
		return test->testGetResults(handle);
	}
	return false;
}