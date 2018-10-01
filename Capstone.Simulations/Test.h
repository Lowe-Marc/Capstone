#pragma once

struct AnimationsStruct {
	int values[];
};

class __declspec(dllexport) Test
{
public:
	Test();
	~Test();
	int * testRunSim();
	int getFrameCount();
	bool getFrameSizes(int handle[]);
	bool testGetResults(int ** handle);
};