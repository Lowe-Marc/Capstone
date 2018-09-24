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
	bool testGetResults(int handle[]);
	bool getFrameCount(int handle);
	bool getFrameSizes(int handle[]);
};