#include "Test.h"
#include "stdafx.h"

using namespace std;


static int frameCount = 0;

// Indicates the number of nodes in the frames
static vector<int> testSize = {};

// Indicates the node IDs in each frame
static vector<vector<int>> testArr = {};


Test::Test() {
}

Test::~Test() {
}

// Should return an array of ints, each int represents the number of nodes in that frame
int * Test::testRunSim() {
	testSize.clear();
	testArr.clear();
	frameCount = 3;
	for (int i = 0; i < frameCount; i++) {
		testSize.push_back(1);
		vector<int> frameIDs = { i };
		testArr.push_back(frameIDs);
	}

	return &testSize[0];
}

// Return the number of animation frames in the simulation results
int Test::getFrameCount() {
	frameCount = testSize.size();
	return frameCount;
}

// Return the number of nodes animated in each frame
bool Test::getFrameSizes(int handle[]) {
	for (int i = 0; i < testSize.size(); i++) {
		handle[i] = testSize[i];
	}
	return true;
}

// Fill the buffer with the frames
bool Test::testGetResults(int ** handle) {
	for (int i = 0; i < testArr.size(); i++) {
		handle[i] = &testArr[i][0];
	}

	/*handle[0] = &testArr[0][0];
	handle[1] = &testArr[1][0];
	handle[2] = &testArr[2][0];*/

	return true;
}
