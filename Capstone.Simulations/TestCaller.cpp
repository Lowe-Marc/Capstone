#include "TestCaller.h"
#include "stdafx.h"


Test* CreateTest()
{
	return new Test();
}

void DdeleteTest(Test* test)
{
	if (test != nullptr)
	{
		delete test;
		test = nullptr;
	}
}

int TestFunction(Test* test)
{
	if (test != nullptr)
	{
		return test->testFunction();
	}
	return -1;
}